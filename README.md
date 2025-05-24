# Event-Based Eye Tracking & Blink/No-Blink Detection

An event‐based camera captures continuous, asynchronous spikes of eye motion which are binned into spatio-temporal voxel grids and fed to a lightweight spiking CNN. The network simultaneously classifies blink vs. no-blink and regresses gaze centroid in each 100 ms window, offering low-latency, high-temporal-resolution inference.

---

## 📁 Dataset

### Raw Data  
- **link to dataset**: https://www.kaggle.com/competitions/event-based-eye-tracking-ais2024/data
- **Event streams** (`.h5` or `.aedat4`): each event is (x, y, t µs, polarity).  
- **Labels**: per-window blink/no-blink (binary) and retina center (x,y).

### Preprocessing  
1. **Windowing**: 100 ms non-overlapping intervals.  
2. **Voxelization**: bin events into T=5 time-bins → `(5,2,H,W)` grids, clipped ±3.  
3. **Resize** to 160 × 120, filter out “empty” windows (sum(voxel) < ε), balance classes via weighted sampling.  
4. **Output**: per-window `.pt` files containing `x` (voxel), `blink` (0/1), `centre` (normalized coords).

---

## 🔧 Model & Training

### Architecture  
- **Spiking CNN**: 3D Conv → Leaky spiking activations → pooled features.  
- **Heads**:  
  - Blink head (binary classification)  
  - Centre head (2-D regression)

### Loss & Optimization  
- **Blink**: Focal loss (α=0.25, γ=2.0) to handle imbalance  
- **Centre**: MSE loss, weighted λ=0.001  
- **Regularization**: dropout, weight decay, data augmentations (jitter, flips, MixUp)  
- **Schedulers**: Cosine warm-restarts + SWA warm-up + EMA smoothing  
- **Training**: 50 epochs, blink-only warm-up, early stopping on val loss

---

## 🚀 Inference

- **AEDAT4 → Voxels**: parse `.aedat4` with aedat.Decoder (or tonic), sliding 100 ms windows.  
- **Model**: load `blink_centre_model_swa.pth`, run on GPU/CPU.  
- **Output video**: render event-count map, overlay red dot at predicted centre, display “blink”/“open”, save as MP4.

---

## ⚙️ Installation & Usage

```bash
git clone https://github.com/you/Event-Based-Eye-Tracking
cd Event-Based-Eye-Tracking
pip install -r requirements.txt
