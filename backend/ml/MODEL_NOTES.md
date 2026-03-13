# Model Notes — Phase 3

## Model Used
- prithivMLmods/Deep-Fake-Detector-Model
- XceptionNet-based, pretrained on deepfake dataset

## Reason for Choice
- High accuracy on FaceForensics++ dataset
- GPU-compatible for fast inference on Colab
- Can generate per-frame heatmaps for explainability

## Sample Results

| Video File | Score | Frames Analyzed | Inconsistency | Label |
|------------|-------|----------------|---------------|-------|
| 183.mp4 | 0.2158 | 30 | False | Likely Real |
| 585.mp4 | 0.2967 | 30 | False | Likely Real |
| 183_253.mp4 | 0.2020 | 30 | False | Likely Real |
| 469_481.mp4 | 0.9978 | 30 | True | Likely Deepfake |
| 866_878.mp4 | 0.2362 | 30 | False | Likely Real |

> Note: Scores calibrated using FAKE_THRESHOLD = 0.75

## Known Limitations
- Subtle deepfakes with per-frame scores <0.75 may still be 'Likely Real'
- Heatmaps generated only for single most suspicious frame
- Frame sampling may miss manipulations outside sampled frames
- Temporal inconsistency threshold may need fine-tuning
