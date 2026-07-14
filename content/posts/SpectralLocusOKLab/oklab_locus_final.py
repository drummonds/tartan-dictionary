"""Spectral locus of monochromatic light in OKLab / OkLCH.

Left:  the intensity-invariant projection (a/L, b/L) -- the OKLab analog of
       the CIE 1931 xy chromaticity horseshoe.
Right: the honest 3D picture -- monochromatic light is a CONE of rays through
       the OKLab origin; any physical normalization (equal radiance here)
       gives a non-planar space curve. Only the artificial equal-L slice
       is planar.

Data: CIE 1931 2-deg CMFs, 1nm, CVRL (ciexyz31_1.csv).
"""
import numpy as np
import matplotlib.pyplot as plt

D = np.loadtxt("ciexyz31_1.csv", delimiter=",")
sel = (D[:, 0] >= 390) & (D[:, 0] <= 700)
lam, xyz_locus = D[sel, 0], D[sel, 1:4]

M1 = np.array([[0.8189330101, 0.3618667424, -0.1288597137],
               [0.0329845436, 0.9293118715, 0.0361456387],
               [0.0482003018, 0.2643662691, 0.6338517070]])
M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
               [1.9779984951, -2.4285922050, 0.4505937099],
               [0.0259040371, 0.7827717662, -0.8086757660]])

def xyz_to_oklab(xyz):
    return np.cbrt(np.atleast_2d(xyz) @ M1.T) @ M2.T   # signed cbrt

XYZ_TO_SRGB = np.array([[ 3.2404542, -1.5371385, -0.4985314],
                        [-0.9692660,  1.8760108,  0.0415560],
                        [ 0.0556434, -0.2040259,  1.0572252]])

def spectral_rgb(xyz):
    rgb = np.clip(np.atleast_2d(xyz) @ XYZ_TO_SRGB.T, 0, None)
    m = rgb.max(axis=-1, keepdims=True)
    rgb = np.where(m > 0, rgb / m, 0) * 0.9
    return np.clip(rgb ** (1 / 2.2), 0, 1)

lab = xyz_to_oklab(xyz_locus)
L, a, b = lab.T
pa, pb = a / L, b / L                       # projective coords
rgbs = spectral_rgb(xyz_locus)

# line of purples: mixtures of the endpoint stimuli (NOT straight in OKLab)
t = np.linspace(0, 1, 200)[:, None]
mix = (1 - t) * xyz_locus[0] + t * xyz_locus[-1]
plab = xyz_to_oklab(mix)
ppa, ppb = plab[:, 1] / plab[:, 0], plab[:, 2] / plab[:, 0]

# sRGB gamut boundary (RGB cube edges R-Y-G-C-B-M-R) in the projection
SRGB_TO_XYZ = np.linalg.inv(XYZ_TO_SRGB)
corners = np.array([[1,0,0],[1,1,0],[0,1,0],[0,1,1],[0,0,1],[1,0,1],[1,0,0]], float)
s = np.linspace(0, 1, 40)[:, None]
edges = np.vstack([(1 - s) * corners[i] + s * corners[i+1] for i in range(6)])
glab = xyz_to_oklab(edges @ SRGB_TO_XYZ.T)
ga, gb = glab[:, 1] / glab[:, 0], glab[:, 2] / glab[:, 0]

fig = plt.figure(figsize=(15, 7.6), dpi=150)
fig.patch.set_facecolor("white")

# ---------------- left: projective diagram ----------------
axL = fig.add_subplot(1, 2, 1)
axL.set_facecolor("white")
for i in range(len(lam) - 1):
    axL.plot(pa[i:i+2], pb[i:i+2], color=rgbs[i], lw=3.2, solid_capstyle="round")
axL.plot(ppa, ppb, color="#888888", lw=1.3, ls=(0, (4, 3)))
axL.plot(ga, gb, color="#bbbbbb", lw=1.1)

cx, cy = pa.mean(), pb.mean()
for wl in [400, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 700]:
    i = int(np.argmin(np.abs(lam - wl)))
    px, py = pa[i], pb[i]
    d = np.hypot(px - cx, py - cy)
    ox, oy = (px - cx) / d * 0.07, (py - cy) / d * 0.07
    axL.annotate(f"{wl}", (px + ox, py + oy), ha="center", va="center",
                 fontsize=8, color="#555555")
    axL.plot([px, px + ox * 0.35], [py, py + oy * 0.35], color="#999999", lw=0.8)

axL.plot(0, 0, "o", mfc="white", mec="#444444", ms=7, mew=1.2)
axL.annotate("D65", (0, 0), xytext=(8, 6), textcoords="offset points",
             fontsize=9, color="#444444")
axL.annotate("line of purples\n(curved in OKLab)", (ppa[100], ppb[100]),
             xytext=(10, -16), textcoords="offset points", fontsize=8.5,
             color="#777777")
axL.annotate("sRGB gamut", (ga[100], gb[100]), xytext=(4, -12),
             textcoords="offset points", fontsize=8.5, color="#999999")
axL.set_aspect("equal")
axL.set_xlabel("a / L")
axL.set_ylabel("b / L")
axL.set_title("Intensity divided out: spectral locus in (a/L, b/L)\n"
              "the OKLab analog of the CIE 1931 xy horseshoe", fontsize=11)
axL.grid(True, color="#eeeeee", lw=0.7)
for sp in axL.spines.values():
    sp.set_color("#cccccc")
axL.tick_params(colors="#888888", labelsize=8.5)

# ---------------- right: the honest 3D picture ----------------
axR = fig.add_subplot(1, 2, 2, projection="3d")
axR.set_facecolor("white")

# equal-radiance locus: XYZ = CMF triple, scaled so peak L ~ 0.95
k = 0.95 / L.max()
lab_er = xyz_to_oklab(xyz_locus * k**3)     # k^3 in XYZ -> k in Lab
Le, ae, be = lab_er.T
for i in range(len(lam) - 1):
    axR.plot(ae[i:i+2], be[i:i+2], Le[i:i+2], color=rgbs[i], lw=3.0)

# cone rays through the origin for a few wavelengths
for wl in [420, 460, 500, 530, 560, 590, 630]:
    i = int(np.argmin(np.abs(lam - wl)))
    axR.plot([0, ae[i] * 1.45], [0, be[i] * 1.45], [0, Le[i] * 1.45],
             color=rgbs[i], lw=0.7, alpha=0.45)

# equal-L slice of the cone (planar by construction), at L0
L0 = 1.0
axR.plot(pa * L0, pb * L0, np.full_like(pa, L0), color="#aaaaaa", lw=1.2,
         ls=(0, (4, 3)))
axR.text(pa[40] * L0, pb[40] * L0, L0 + 0.12, "equal-L slice (planar)",
         fontsize=8, color="#888888")
axR.text(ae[210], be[210], Le[210] + 0.22, "equal-radiance locus\n(not planar)",
         fontsize=8, color="#444444")

axR.scatter([0], [0], [0], color="#444444", s=12)
axR.text(0, 0, -0.10, "origin (black)", fontsize=8, color="#666666",
         ha="center")
axR.set_xlabel("a", fontsize=9, labelpad=-2)
axR.set_ylabel("b", fontsize=9, labelpad=-2)
axR.set_zlabel("L", fontsize=9, labelpad=-2)
axR.set_title("Full 3D OKLab: monochromatic light is a cone of rays;\n"
              "physical normalizations give non-planar space curves", fontsize=11)
axR.tick_params(colors="#888888", labelsize=7)
axR.set_box_aspect((1, 1, 0.85))
axR.view_init(elev=18, azim=-58)
axR.xaxis.pane.set_facecolor("white")
axR.yaxis.pane.set_facecolor("white")
axR.zaxis.pane.set_facecolor("white")

fig.tight_layout()
out = "oklab_spectral_locus_3d.png"
fig.savefig(out, facecolor="white", bbox_inches="tight")
print(out)
