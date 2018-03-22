#!/usr/bin/env python3

import os
import semver
import shutil
import subprocess

EXPECTED_BRANCH="master"
BUILD_DIR="build"
DEPLOY_REPO_DIR="../graphit-ghpages"
VERSION_FILENAME="{}/.version".format(DEPLOY_REPO_DIR)

def validate_deploy_repo_dir():
  if not os.path.isfile(VERSION_FILENAME):
    raise RuntimeError("deploy repo dir not found")

def update_version(apply_func):
  version = ""
  with open(VERSION_FILENAME, "rt") as f:
    version = f.readline().rstrip()
  if not version.startswith("v"):
    raise RuntimeError("version file not recognized")
  version = "v" + apply_func(version[1:])
  with open(VERSION_FILENAME, "wt") as f:
    f.write("{}\n".format(version))
  return version

def check_and_call(cmd, shell=False):
  subprocess.check_call(cmd, shell=shell)

def check_and_run(cmd, shell=False):
  result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, shell=shell)
  return result.stdout.decode("utf-8")

def ensure_on_expected_branch():
  if check_and_run(["git", "rev-parse", "--abbrev-ref", "HEAD"]).rstrip() != EXPECTED_BRANCH:
    raise RuntimeError("not on branch: {}".format(EXPECTED_BRANCH))

def ensure_clean_git_branch():
  if check_and_run(["git", "diff"]) != "":
    raise RuntimeError("there are uncommitted changes")
  if check_and_run(["git", "ls-files", "-o", "--directory", "--exclude-standard"]) != "":
    raise RuntimeError("there are untracked files")

def build():
  check_and_call(["rm", "-rf", BUILD_DIR])
  check_and_call(["npm", "run-script", BUILD_DIR])

def copy_build_artifacts():
  # clean out the target; everything we want to keep starts with a "."
  check_and_call(["rm -rf \"{}\"/*".format(DEPLOY_REPO_DIR)], shell=True)

  check_and_call(["cp -rpv \"{}\"/* \"{}\"".format(BUILD_DIR, DEPLOY_REPO_DIR)], shell=True)

master_repo_dir = os.getcwd()

validate_deploy_repo_dir()
ensure_on_expected_branch()
ensure_clean_git_branch()
build()
copy_build_artifacts()
version = update_version(lambda v: semver.bump_patch(v))

os.chdir(DEPLOY_REPO_DIR)
check_and_call(["git", "add", "-A"])
check_and_call(["git", "commit", "-m", version])
check_and_call(["git", "push"])

os.chdir(master_repo_dir)
check_and_call(["git", "tag", version])
check_and_call(["git", "push"])

print("Successfully pushed version {}!".format(version))
