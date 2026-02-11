#!/bin/bash
set -e

CLUSTER_NAME="yellbook-eks"
REGION="ap-southeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
OIDC_PROVIDER=$(aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query 'cluster.identity.oidc.issuer' --output text | cut -d '/' -f 5)

echo "Creating IAM Role for ECR Pull and EBS/EFS Access"

# Trust Policy
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/oidc.eks.${REGION}.amazonaws.com/id/${OIDC_PROVIDER}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.${REGION}.amazonaws.com/id/${OIDC_PROVIDER}:sub": "system:serviceaccount:yellowbooks:yellowbooks-sa"
        }
      }
    }
  ]
}
EOF

# Create IAM Role
aws iam create-role \
  --role-name yellowbooks-eks-role \
  --assume-role-policy-document file:///tmp/trust-policy.json \
  --region $REGION 2>/dev/null || echo "Role already exists"

# Attach ECR Pull Policy
aws iam attach-role-policy \
  --role-name yellowbooks-eks-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly \
  --region $REGION 2>/dev/null || echo "Policy already attached"

# Attach EBS Policy for EBS CSI Driver
aws iam attach-role-policy \
  --role-name yellowbooks-eks-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --region $REGION 2>/dev/null || echo "EBS policy already attached"

echo "✅ IAM Role created: yellowbooks-eks-role"
echo "   ARN: arn:aws:iam::${AWS_ACCOUNT_ID}:role/yellowbooks-eks-role"
