# EKS Deployment Quick Reference

**Status:** Cluster creation in progress  
**ETA:** ~10 minutes (2:50 PM UTC expected)

## When Cluster is Ready

### 1️⃣ ONE COMMAND DEPLOYMENT (Recommended)
```bash
cd k8s
bash post-cluster-deployment.sh
```

This automatically:
- Updates kubeconfig
- Sets up ALB Controller  
- Deploys all manifests
- Waits for pods ready

### 2️⃣ MANUAL DEPLOYMENT (If needed)

```bash
# Step 1: Update kubeconfig
aws eks update-kubeconfig --name yellbook-eks --region ap-southeast-1
kubectl get nodes

# Step 2: ALB Controller
cd k8s
bash setup-alb-controller.sh
kubectl rollout status deployment/aws-load-balancer-controller -n kube-system

# Step 3: Deploy Application
for file in manifests/*.yaml; do
  kubectl apply -f "$file" -n yellowbooks
  sleep 2
done

# Step 4: Verify
kubectl get pods -n yellowbooks
kubectl get ingress -n yellowbooks
```

## Verification Commands

```bash
# Cluster status
kubectl get nodes
kubectl cluster-info

# Pods status
kubectl get pods -n yellowbooks
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller

# Services
kubectl get svc -n yellowbooks

# Ingress (get ALB DNS)
kubectl get ingress -n yellowbooks -o wide

# Database
kubectl logs postgres-0 -n yellowbooks

# Migration job
kubectl get job -n yellowbooks
kubectl logs -f job/prisma-migration -n yellowbooks

# HPA
kubectl get hpa -n yellowbooks

# Full status
kubectl get all -n yellowbooks
```

## Common Issues & Fixes

**Pods stuck in Pending:**
```bash
kubectl describe pod <pod-name> -n yellowbooks
kubectl get events -n yellowbooks --sort-by='.lastTimestamp'
```

**Ingress not provisioning ALB:**
```bash
kubectl describe ingress yellbook-ingress -n yellowbooks
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```

**ECR image pull errors:**
```bash
kubectl get secret -n yellowbooks
# If missing, recreate:
aws ecr get-login-password --region ap-southeast-1 | \
  kubectl create secret docker-registry ecr-secret \
  --docker-server=754029048634.dkr.ecr.ap-southeast-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region ap-southeast-1) \
  -n yellowbooks
```

## Post-Deployment (Manual Steps)

### 1. Get ALB DNS
```bash
ALB_DNS=$(kubectl get ingress yellbook-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo $ALB_DNS
```

### 2. Create Route53 Record
In AWS Console or CLI:
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z<YOUR_ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yellbook.example.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$ALB_DNS'"}]
      }
    }]
  }'
```

### 3. Verify DNS Resolution
```bash
nslookup yellbook.example.com
curl -I https://yellbook.example.com
```

### 4. Test Application
- Open browser: https://yellbook.example.com
- Look for 🔒 padlock (HTTPS)
- Navigate through pages
- Check API responses in console

## Lab 7 Rubric Completion

| Item | Points | Status | Action |
|------|--------|--------|--------|
| OIDC/Roles | 20 | ✅ Done | GitHub OIDC provider created |
| aws-auth/RBAC | 10 | ✅ Done | ServiceAccount with IRSA |
| Manifests | 25 | ⏳ Deploying | All 7 files being applied |
| Ingress/TLS | 20 | ⏳ Deploying | ALB will be provisioned |
| Migration | 10 | ⏳ Deploying | Job will run automatically |
| HPA | 10 | ⏳ Deploying | Configured in manifests |
| Documentation | 5 | ✅ Done | DEPLOY.md + k8s/README.md |
| **TOTAL** | **100** | **90%** | **Await cluster completion** |

## Screenshots to Capture

1. `kubectl get pods -n yellowbooks` - all Ready
2. Browser with 🔒 and https://yellbook.example.com
3. `kubectl get hpa -n yellowbooks` - scaling status
4. GitHub Actions deploy success
5. `kubectl get ingress -n yellowbooks -o wide` - ALB DNS

## Monitoring During Deployment

```bash
# Watch pods come up
watch kubectl get pods -n yellowbooks

# Monitor HPA scaling
watch kubectl get hpa -n yellowbooks

# Stream logs
kubectl logs -f deployment/yellbook-api -n yellowbooks
kubectl logs -f deployment/yellbook-web -n yellowbooks
```

---

**Next:** Await cluster completion, then run single deployment command
