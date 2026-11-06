"""Level breakfast photos to the tray / lunchbox rim, then crop table margins."""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

SRC = Path(r"d:\Software Project\Lotus Korean Hotel\web\tmp-breakfast")
OUT = Path(r"d:\Software Project\Lotus Korean Hotel\web\public\images\hotel\breakfast")
OUT.mkdir(parents=True, exist_ok=True)

MAX_DEG = 2.8


def table_mask(img: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    L, a, b = cv2.split(lab)
    a16 = a.astype(np.int16)
    b16 = b.astype(np.int16)
    m = (L >= 160) & (np.abs(a16 - 128) <= 16) & (np.abs(b16 - 128) <= 26)
    m |= L >= 205
    mask = m.astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    return cv2.morphologyEx(mask, cv2.MORPH_OPEN, k)


def tray_boundary(img: np.ndarray) -> np.ndarray:
    table = table_mask(img)
    fg = cv2.bitwise_not(table)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    return cv2.bitwise_and(cv2.dilate(table, k), fg)


def theil_sen_deg(xs: np.ndarray, ys: np.ndarray) -> tuple[float | None, float]:
    if xs.size < 30:
        return None, 99.0
    slopes: list[np.ndarray] = []
    for i in range(0, xs.size, 2):
        dx = xs[i + 1 :] - xs[i]
        dy = ys[i + 1 :] - ys[i]
        ok = np.abs(dx) >= 60
        if np.any(ok):
            slopes.append(dy[ok] / dx[ok])
    if not slopes:
        return None, 99.0
    m = float(np.median(np.concatenate(slopes)))
    pred = m * (xs - xs.mean()) + ys.mean()
    mad = float(np.median(np.abs(ys - pred)))
    return float(np.degrees(np.arctan(m))), mad


def band_points(boundary: np.ndarray, top: bool) -> tuple[np.ndarray, np.ndarray]:
    h, w = boundary.shape
    if top:
        ymin, ymax, pick_min = 2, int(h * 0.22), True
    else:
        ymin, ymax, pick_min = int(h * 0.78), h - 2, False
    xs: list[int] = []
    ys: list[int] = []
    for x in range(int(w * 0.18), int(w * 0.82), 2):
        col = boundary[ymin:ymax, x]
        hits = np.flatnonzero(col > 0)
        if hits.size == 0:
            continue
        y = ymin + int(hits[0] if pick_min else hits[-1])
        xs.append(x)
        ys.append(y)
    return np.asarray(xs, np.float64), np.asarray(ys, np.float64)


def silhouette_angle(img: np.ndarray) -> float | None:
    boundary = tray_boundary(img)
    best: tuple[float, float] | None = None
    for top in (True, False):
        xs, ys = band_points(boundary, top=top)
        deg, mad = theil_sen_deg(xs, ys)
        if deg is None or mad > 2.0 or abs(deg) > MAX_DEG:
            continue
        if best is None or mad < best[1]:
            best = (deg, mad)
    return None if best is None else best[0]


def tray_slope_deg(img: np.ndarray) -> float:
    sil = silhouette_angle(img)
    if sil is None:
        return 0.0
    return float(np.clip(sil, -MAX_DEG, MAX_DEG))


def rotate(img: np.ndarray, angle: float) -> np.ndarray:
    if abs(angle) < 0.12:
        return img
    h, w = img.shape[:2]
    m = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    cos, sin = abs(m[0, 0]), abs(m[0, 1])
    nw, nh = int(h * sin + w * cos), int(h * cos + w * sin)
    m[0, 2] += (nw - w) / 2
    m[1, 2] += (nh - h) / 2
    return cv2.warpAffine(img, m, (nw, nh), flags=cv2.INTER_LANCZOS4, borderValue=(206, 206, 206))


def crop_to_tray(img: np.ndarray) -> np.ndarray:
    table = table_mask(img)
    fg = cv2.bitwise_not(table)
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11))
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, k)
    n, labels, stats, _ = cv2.connectedComponentsWithStats((fg > 0).astype(np.uint8), 8)
    if n <= 1:
        return img
    idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    x, y, bw, bh, _area = stats[idx]
    h, w = img.shape[:2]
    pad_x = max(2, int(bw * 0.006))
    pad_y = max(2, int(bh * 0.006))
    x0 = max(0, x - pad_x)
    y0 = max(0, y - pad_y)
    x1 = min(w, x + bw + pad_x)
    y1 = min(h, y + bh + pad_y)
    if (x1 - x0) < 0.70 * w or (y1 - y0) < 0.70 * h:
        return img
    return img[y0:y1, x0:x1]


def choose_rotation(img: np.ndarray, detected: float) -> tuple[np.ndarray, float, float]:
    if abs(detected) < 0.12:
        return img, 0.0, abs(detected)
    aligned = rotate(img, detected)
    remain = abs(tray_slope_deg(aligned))
    flipped = rotate(img, -detected)
    remain_flip = abs(tray_slope_deg(flipped))
    if remain_flip + 0.15 < remain:
        return flipped, -detected, remain_flip
    return aligned, detected, remain


def process(src: Path, dest: Path) -> str:
    img = cv2.imread(str(src))
    if img is None:
        raise RuntimeError(f"cannot read {src}")
    detected = tray_slope_deg(img)
    aligned, used, remain = choose_rotation(img, detected)
    cropped = crop_to_tray(aligned)
    blur = cv2.GaussianBlur(cropped, (0, 0), 0.65)
    sharp = cv2.addWeighted(cropped, 1.16, blur, -0.16, 0)
    sh, sw = sharp.shape[:2]
    if sw > 1600:
        sharp = cv2.resize(sharp, (1600, int(sh * 1600 / sw)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(dest), sharp, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    return (
        f"{dest.name}  detect={detected:+.2f}  used={used:+.2f}  "
        f"remain={remain:.2f}  {sharp.shape[1]}x{sharp.shape[0]}"
    )


def main() -> None:
    files = sorted(SRC.glob("src-*.png"))
    for i, src in enumerate(files, start=1):
        print(process(src, OUT / f"breakfast-{i:02d}.jpg"), flush=True)
    print(f"done {len(files)} files")


if __name__ == "__main__":
    main()
