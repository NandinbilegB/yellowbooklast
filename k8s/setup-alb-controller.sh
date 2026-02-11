#!/bin/bash

# Script to setup ALB Ingress Controller after EKS cluster creation
# This should run after the EKS cluster is fully created

set -e

REGION="ap-southeast-1"
CLUSTER_NAME="yellbook-eks"
AWS_ACCOUNT_ID="754029048634"

echo "=========================================="
echo "Setting up ALB Ingress Controller"
echo "=========================================="

# 1. Create IAM policy for ALB controller
echo "📝 Creating IAM policy for ALB controller..."

ALB_POLICY=$(cat <<'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "elbv2:CreateLoadBalancer",
                "elbv2:CreateTargetGroup",
                "elbv2:CreateListener",
                "elbv2:DeleteLoadBalancer",
                "elbv2:DeleteTargetGroup",
                "elbv2:DeleteListener",
                "elbv2:DescribeLoadBalancers",
                "elbv2:DescribeTargetGroups",
                "elbv2:DescribeListeners",
                "elbv2:DescribeTags",
                "elbv2:ModifyLoadBalancerAttributes",
                "elbv2:ModifyTargetGroupAttributes",
                "elbv2:ModifyListener",
                "elbv2:RegisterTargets",
                "elbv2:DeregisterTargets",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSubnets",
                "ec2:CreateSecurityGroup",
                "ec2:CreateTags",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:RevokeSecurityGroupIngress",
                "ec2:DescribeInstanceStatus",
                "acm:DescribeCertificate",
                "acm:ListCertificates"
            ],
            "Resource": "*"
        }
    ]
}
EOF
)

aws iam create-policy \
  --policy-name ALBIngressControllerPolicy \
  --policy-document "$ALB_POLICY" \
  --region "$REGION" || echo "Policy already exists"

# 2. Create ServiceAccount with IRSA
echo "🔑 Creating ServiceAccount with IRSA..."

kubectl create namespace kube-system || true

# Get OIDC provider
OIDC_ID=$(aws eks describe-cluster \
  --name "$CLUSTER_NAME" \
  --region "$REGION" \
  --query 'cluster.identity.oidc.issuer' \
  --output text | cut -d '/' -f 5)

# Create trust policy
TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/oidc.eks.${REGION}.amazonaws.com/id/${OIDC_ID}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.${REGION}.amazonaws.com/id/${OIDC_ID}:sub": "system:serviceaccount:kube-system:aws-load-balancer-controller"
        }
      }
    }
  ]
}
EOF
)

aws iam create-role \
  --role-name ALBIngressControllerRole \
  --assume-role-policy-document "$TRUST_POLICY" \
  --region "$REGION" || echo "Role already exists"

# Attach policy
aws iam attach-role-policy \
  --role-name ALBIngressControllerRole \
  --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/ALBIngressControllerPolicy \
  --region "$REGION" || echo "Policy already attached"

# 3. Create ServiceAccount
kubectl create serviceaccount aws-load-balancer-controller -n kube-system || true

# Annotate ServiceAccount with IAM role
kubectl patch serviceaccount aws-load-balancer-controller \
  -n kube-system \
  -p "{\"metadata\":{\"annotations\":{\"eks.amazonaws.com/role-arn\":\"arn:aws:iam::${AWS_ACCOUNT_ID}:role/ALBIngressControllerRole\"}}}" || true

# 4. Install ALB Controller via Helm
echo "📦 Installing ALB Ingress Controller via Helm..."

# Add Helm repo
helm repo add eks https://aws.github.io/eks-charts || true
helm repo update

# Install ALB controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="$CLUSTER_NAME" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  || helm upgrade aws-load-balancer-controller eks/aws-load-balancer-controller \
     -n kube-system \
     --set clusterName="$CLUSTER_NAME" \
     --set serviceAccount.create=false \
     --set serviceAccount.name=aws-load-balancer-controller

# 5. Verify installation
echo "✅ Verifying ALB Controller installation..."
kubectl rollout status deployment/aws-load-balancer-controller -n kube-system --timeout=3m

echo ""
echo "=========================================="
echo "✅ ALB Ingress Controller setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure Route53 records"
echo "2. Create ACM certificates"
echo "3. Deploy application manifests"
echo "4. Monitor ingress creation"
