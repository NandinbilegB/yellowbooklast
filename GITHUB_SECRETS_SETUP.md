# GitHub Secrets Setup Guide

## Step 1: Get Account ID (already have from AWS)
Account ID: 754029048634

## Step 2: Get IAM User Credentials
# Run this command to see your IAM user details:
# aws iam get-user

# If you need to create a new access key:
# aws iam create-access-key --user-name dev-user

# You should have received:
# - AWS_ACCESS_KEY_ID: AKIA...
# - AWS_SECRET_ACCESS_KEY: wJalr...

## Step 3: GitHub CLI - Add Secrets Automatically

# Install GitHub CLI first (if not installed)
# https://cli.github.com/

# Then run:
# gh auth login

# Add secrets using GitHub CLI:
# gh secret set AWS_ACCOUNT_ID --body "754029048634"
# gh secret set AWS_ACCESS_KEY_ID --body "YOUR_ACCESS_KEY"
# gh secret set AWS_SECRET_ACCESS_KEY --body "YOUR_SECRET_KEY"

## Step 4: OR Add via Web UI
# 1. Go to: https://github.com/Baterdene23/yellbook/settings/secrets/actions
# 2. Click "New repository secret"
# 3. Name: AWS_ACCOUNT_ID
#    Value: 754029048634
# 4. Click "Add secret"
# 5. Repeat for AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

Write-Host "=== GitHub Secrets Setup ===" -ForegroundColor Green
Write-Host ""
Write-Host "Required Secrets:" -ForegroundColor Cyan
Write-Host "1. AWS_ACCOUNT_ID = 754029048634"
Write-Host "2. AWS_ACCESS_KEY_ID = (from your IAM user)"
Write-Host "3. AWS_SECRET_ACCESS_KEY = (from your IAM user)"
Write-Host ""
Write-Host "Add them at:" -ForegroundColor Yellow
Write-Host "https://github.com/Baterdene23/yellbook/settings/secrets/actions"
