# AWS EKS Deployment Guide - YellBook

## Current Status

✅ **AWS Account**: 754029048634 (ap-southeast-1)  
✅ **EKS Stack**: Creating (yellbook-eks-stack)  
✅ **ECR Repositories**: Ready
- `yellbook/api`
- `yellbook/web`

## Quick Deployment Steps

### Step 1: Monitor Stack Creation (Current)
```bash
# Check stack status
aws cloudformation describe-stacks \
  --stack-name yellbook-eks-stack \
  --region ap-southeast-1 \
  --query 'Stacks[0].StackStatus' \
  --output text

# Wait for completion (takes ~15-20 minutes)
aws cloudformation wait stack-create-complete \
  --stack-name yellbook-eks-stack \
  --region ap-southeast-1
```

### Step 2: Configure kubectl
Once stack is ready:
```bash
# Update kubeconfig
aws eks update-kubeconfig \
  --name yellbook-eks \
  --region ap-southeast-1

# Verify cluster access
kubectl get nodes
```

### Step 3: Build & Push Docker Images

**Option A: Local Docker (if Docker running)**
```bash
# Build images
docker build -t yellbook/api:latest -f apps/api/Dockerfile .
docker build -t yellbook/web:latest -f apps/web/Dockerfile .

# Get ECR login
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin 754029048634.dkr.ecr.ap-southeast-1.amazonaws.com

# Push to ECR
docker tag yellbook/api:latest \
  754029048634.dkr.ecr.ap-southeast-1.amazonaws.com/yellbook/api:latest
docker push 754029048634.dkr.ecr.ap-southeast-1.amazonaws.com/yellbook/api:latest

docker tag yellbook/web:latest \
  754029048634.dkr.ecr.ap-southeast-1.amazonaws.com/yellbook/web:latest
docker push 754029048634.dkr.ecr.ap-southeast-1.amazonaws.com/yellbook/web:latest
```

**Option B: GitHub Actions (Recommended)**
- Commit code to GitHub
- CI/CD workflow automatically:
  1. Builds Docker images
  2. Pushes to ECR
  3. (Can trigger K8s deployment)

### Step 4: Deploy to EKS

Create namespace:
```bash
kubectl create namespace yellowbooks
```

Apply manifests:
```bash
# Deploy PostgreSQL
kubectl apply -f k8s/manifests/postgres-statefulset.yaml

# Deploy Redis (if using Lab 8)
kubectl apply -f k8s/manifests/redis-deployment.yaml

# Deploy API
kubectl apply -f k8s/manifests/api-deployment.yaml

# Deploy Web
kubectl apply -f k8s/manifests/web-deployment.yaml

# Deploy services
kubectl apply -f k8s/manifests/services.yaml
```

### Step 5: Verify Deployment
```bash
# Check pods
kubectl get pods -n yellowbooks

# Check services
kubectl get svc -n yellowbooks

# Check logs
kubectl logs -f deployment/api -n yellowbooks
kubectl logs -f deployment/web -n yellowbooks
```

### Step 6: Access Application

**Get Load Balancer URL:**
```bash
kubectl get svc -n yellowbooks | grep LoadBalancer
```

Then access:
- **Web**: `http://<EXTERNAL-IP>`
- **API**: `http://<EXTERNAL-IP>:3001`

## Environment Variables for EKS

Update K8s secrets for environment variables:
```bash
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=GITHUB_ID=... \
  --from-literal=GITHUB_SECRET=... \
  -n yellowbooks
```

## Troubleshooting

### Stack Creation Failed
```bash
# Check error details
aws cloudformation describe-stacks \
  --stack-name yellbook-eks-stack \
  --region ap-southeast-1 \
  --query 'Stacks[0].StackStatusReason'

# Delete and retry
aws cloudformation delete-stack \
  --stack-name yellbook-eks-stack \
  --region ap-southeast-1
```

### kubectl Connection Refused
```bash
# Update kubeconfig
aws eks update-kubeconfig \
  --name yellbook-eks \
  --region ap-southeast-1

# Verify cluster exists
aws eks describe-cluster \
  --name yellbook-eks \
  --region ap-southeast-1
```

### Pod not starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n yellowbooks

# Check events
kubectl get events -n yellowbooks --sort-by='.lastTimestamp'

# Check image pull
kubectl logs <pod-name> -n yellowbooks
```

## Cost Optimization

- EKS cluster: ~$0.10/hour
- EC2 nodes: ~$0.04-0.20/hour (depends on instance type)
- RDS database: ~$0.20/hour
- Total: ~$150-200/month for development setup

Monitor costs:
```bash
aws ce get-cost-and-usage \
  --time-period Start=2025-12-01,End=2025-12-08 \
  --granularity DAILY \
  --metrics BlendedCost
```

## Next Steps

1. ✅ EKS Stack Creation (in progress)
2. ⏳ Configure kubectl
3. ⏳ Build & Push Docker Images
4. ⏳ Deploy K8s Manifests
5. ⏳ Setup ALB Controller
6. ⏳ Configure Ingress
7. ⏳ Setup monitoring (CloudWatch)
8. ⏳ Setup auto-scaling

## Useful Resources

- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes YAML Examples](https://kubernetes.io/docs/concepts/configuration/overview/)
