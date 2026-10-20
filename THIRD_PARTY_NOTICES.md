# Background processing

- The optional local AI runtime is [Transformers.js](https://github.com/huggingface/transformers.js), Apache-2.0.
- The model is [BiRefNet Lite 512 by Studio Ludens](https://huggingface.co/studioludens/birefnet-lite-512), an ONNX export of [ZhengPeng7/BiRefNet_lite](https://huggingface.co/ZhengPeng7/BiRefNet_lite), published under MIT. It is downloaded on demand from Hugging Face and cached in the browser. User images are processed locally.
- Model attribution: Copyright (c) 2024 ZhengPeng; Copyright (c) 2026 Studio Ludens V.O.F. The model license is available at https://huggingface.co/studioludens/birefnet-lite-512/blob/main/LICENSE.
- Gradient extension uses local edge-color extrapolation. It is intended for smooth studio backgrounds and is not generative inpainting.
