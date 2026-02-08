# ******************************************************************************
#  UniChat
#  Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
#
#  This program and the accompanying materials are made
#  available under the terms of the Eclipse Public License 2.0
#  which is available at https://www.eclipse.org/legal/epl-2.0/
#
#  SPDX-License-Identifier: EPL-2.0
# ******************************************************************************

from enum import Enum

class Ordering(Enum):
    LESS = -1
    EQUAL = 0
    GREATER = 1

    def __str__(self):
        if self == Ordering.LESS:
            return "LESS"
        elif self == Ordering.EQUAL:
            return "EQUAL"
        elif self == Ordering.GREATER:
            return "GREATER"
        else:
            return "UNKNOWN"

class PreReleaseType(Enum):
    ALPHA = ("alpha", 1)
    BETA = ("beta", 2)
    RC = ("rc", 3)

    def __init__(self, label, order):
        self.label = label
        self.order = order

    def __str__(self):
        return self.label

def pre_release_type_to_number(pre_release: tuple[PreReleaseType, int] | None) -> tuple[int, int]:
    pre_type = 4
    pre_number = 0

    if pre_release is not None:
        pre_type = pre_release[0].order
        pre_number = pre_release[1]

    return (pre_type, pre_number)

class Version:
    major: int
    minor: int
    patch: int
    pre_release: tuple[PreReleaseType, int] | None
    build_metadata: str | None

    @staticmethod
    def parse(value: str) -> 'Version':
        main_and_meta_parts = value.split("+", 1)
        main_part = main_and_meta_parts[0]
        build_metadata = main_and_meta_parts[1] if len(main_and_meta_parts) == 2 else None

        main_and_pre_parts = main_part.split("-", 1)
        version_part = main_and_pre_parts[0]
        pre_release_part = main_and_pre_parts[1] if len(main_and_pre_parts) == 2 else None

        # ==================================================================== #

        version_numbers = version_part.split(".")
        major = int(version_numbers[0])
        minor = int(version_numbers[1])
        patch = int(version_numbers[2])

        # ==================================================================== #

        pre_release = None
        if pre_release_part is not None:
            pre_release_parts = pre_release_part.split(".", 1)
            pre_release_label = pre_release_parts[0]
            pre_release_number = int(pre_release_parts[1]) if len(pre_release_parts) == 2 else 0

            for pre_type in PreReleaseType:
                if pre_type.label == pre_release_label:
                    pre_release = (pre_type, pre_release_number)
                    break

            if pre_release is None:
                raise ValueError(f"Unknown pre-release label: {pre_release_label}")

        return Version(major, minor, patch, pre_release, build_metadata)

    def __init__(self, major: int, minor: int, patch: int, pre_release: tuple[PreReleaseType, int] | None = None, build_metadata: str | None = None):
        self.major = major
        self.minor = minor
        self.patch = patch
        self.pre_release = pre_release
        self.build_metadata = build_metadata

    def cmp(self, other: 'Version') -> Ordering:
        if self.major != other.major:
            return Ordering.GREATER if self.major > other.major else Ordering.LESS
        if self.minor != other.minor:
            return Ordering.GREATER if self.minor > other.minor else Ordering.LESS
        if self.patch != other.patch:
            return Ordering.GREATER if self.patch > other.patch else Ordering.LESS

        self_pre_type, self_pre_number = pre_release_type_to_number(self.pre_release)
        other_pre_type, other_pre_number = pre_release_type_to_number(other.pre_release)
        if self_pre_type != other_pre_type:
            return Ordering.GREATER if self_pre_type > other_pre_type else Ordering.LESS

        if self_pre_number != other_pre_number:
            return Ordering.GREATER if self_pre_number > other_pre_number else Ordering.LESS

        return Ordering.EQUAL

    def __lt__(self, other):
        return self.cmp(other) == Ordering.LESS

    def __le__(self, other):
        cmp_result = self.cmp(other)
        return cmp_result == Ordering.LESS or cmp_result == Ordering.EQUAL

    def __eq__(self, other):
        return self.cmp(other) == Ordering.EQUAL

    def __ne__(self, other):
        return self.cmp(other) != Ordering.EQUAL

    def __gt__(self, other):
        return self.cmp(other) == Ordering.GREATER

    def __ge__(self, other):
        cmp_result = self.cmp(other)
        return cmp_result == Ordering.GREATER or cmp_result == Ordering.EQUAL

    def __str__(self):
        version_str = f"{self.major}.{self.minor}.{self.patch}"

        if self.pre_release is not None:
            version_str += f"-{self.pre_release[0]}.{self.pre_release[1]}"

        if self.build_metadata is not None:
            version_str += f"+{self.build_metadata}"

        return version_str
