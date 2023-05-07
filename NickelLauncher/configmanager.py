import json

from customtypes import JSONType


def load_config(path: str) -> JSONType:
    try:
        with open(path) as f:
            config = json.load(f)
        return config
    except (OSError, json.JSONDecodeError) as e:
        raise ConfigLoadError from e


def save_config(config: JSONType, path: str, ignore_errors: bool = False):
    try:
        with open(path, 'w') as f:
            json.dump(config, f, indent=4)
    except OSError:
        if ignore_errors:
            return
        raise


class ConfigLoadError(Exception):
    pass
