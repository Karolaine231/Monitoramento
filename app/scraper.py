import sys
import csv
import json
import re
import time
import random
import urllib.parse
import webbrowser
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# ... resto do código igual ao seu programa .py
