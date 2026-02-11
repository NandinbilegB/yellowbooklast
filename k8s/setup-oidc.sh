#!/bin/bash
set -e

CLUSTER_NAME="yellbook-eks"
REGION="ap-southeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Setting up OIDC Provider for EKS Cluster: $CLUSTER_NAME"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "Region: $REGION"

# Get OIDC Provider URL from EKS cluster
OIDC_URL=$(aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query 'cluster.identity.oidc.issuer' --output text)
OIDC_ID=$(echo $OIDC_URL | cut -d '/' -f 5)

echo "OIDC URL: $OIDC_URL"
echo "OIDC ID: $OIDC_ID"

# Create IAM OIDC Provider
aws iam create-open-id-connect-provider \
  --url $OIDC_URL \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list $(curl -s https://oidc.eks.${REGION}.amazonaws.com/id/${OIDC_ID}/.well-known/openid-configuration | grep -o '"thumbprint":"[^"]*' | cut -d'"' -f4) \
  --region $REGION 2>/dev/null || echo "OIDC Provider already exists"

echo "✅ OIDC Provider setup complete"
