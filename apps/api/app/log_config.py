"""Application logging setup for local development and deployed runs.

Uvicorn configures its own access and error loggers but does not enable INFO output
from application modules. Wire the ``app`` logger tree so dev-only messages such as
passwordless login codes appear in the API terminal.
"""

import logging
import sys


def configure_logging() -> None:
    app_logger = logging.getLogger("app")
    if app_logger.handlers:
        return

    app_logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(logging.Formatter("%(levelname)s:     %(message)s"))
    app_logger.addHandler(handler)
    app_logger.propagate = False
