import tensorflow as tf

_model = None

def get_model():
    global _model
    if _model is None:
        _model = tf.keras.applications.Xception(
            weights="imagenet",
            include_top=False,
            pooling="avg"
        )
        print("Model loaded!")
    return _model
