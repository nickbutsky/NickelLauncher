from __future__ import annotations
from typing import Callable, Self, Any
from pathlib import Path

from ordered_set import OrderedSet

from customtypes import UserPath
from core.version import Version, Architecture


class InstanceDirectory(UserPath):
    @property
    def com_mojang(self) -> Path:
        return self / 'com.mojang'

    @property
    def config_json(self) -> Path:
        return self / 'config.json'


class Instance:
    def __init__(self, name: str, version: Version, architecture_choice: Architecture, directory: InstanceDirectory):
        self._name = name.strip()
        self._version = version
        if architecture_choice not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture_choice
        self._directory = directory

        self._subscribers: OrderedSet[Callable[[Self], Any]] = OrderedSet()

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, name: str):
        self._name = name.strip()
        self._notify_subscribers()

    @property
    def version(self) -> Version:
        return self._version

    @version.setter
    def version(self, version: Version):
        self._version = version
        if self.architecture_choice not in self.version.available_architectures:
            self.architecture_choice = self.version.available_architectures[0]
        self._notify_subscribers()

    @property
    def architecture_choice(self) -> Architecture:
        return self._architecture_choice

    @architecture_choice.setter
    def architecture_choice(self, architecture: Architecture):
        if architecture not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture
        self._notify_subscribers()

    @property
    def directory(self) -> InstanceDirectory:
        return self._directory

    def to_dict(self) -> dict:
        return {
            'format_version': 1,
            'name': self.name,
            'version': {
                'name': self.version.name,
                'architecture_choice': self.architecture_choice
            }
        }

    def subscribe_to_change(self, subscriber: Callable[[Instance], Any]):
        self._subscribers.add(subscriber)

    def _notify_subscribers(self):
        for subscriber in self._subscribers:
            subscriber(self)


class UnavailableArchitectureError(ValueError):
    pass
