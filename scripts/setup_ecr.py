import boto3
import json

# AWS clients
ecr_client = boto3.client('ecr', region_name='ap-southeast-1')

# API repository
try:
    api_response = ecr_client.create_repository(
        repositoryName='yellbook/api',
        imageScanningConfiguration={'scanOnPush': True},
        encryptionConfiguration={'encryptionType': 'AES256'}
    )
    print("✅ API Repository created:")
    print(json.dumps(api_response['repository'], indent=2, default=str))
except ecr_client.exceptions.RepositoryAlreadyExistsException:
    print("⚠️  API Repository already exists")
except Exception as e:
    print(f"❌ Error creating API repository: {e}")

print("\n" + "="*60 + "\n")

# Web repository
try:
    web_response = ecr_client.create_repository(
        repositoryName='yellbook/web',
        imageScanningConfiguration={'scanOnPush': True},
        encryptionConfiguration={'encryptionType': 'AES256'}
    )
    print("✅ Web Repository created:")
    print(json.dumps(web_response['repository'], indent=2, default=str))
except ecr_client.exceptions.RepositoryAlreadyExistsException:
    print("⚠️  Web Repository already exists")
except Exception as e:
    print(f"❌ Error creating Web repository: {e}")

print("\n" + "="*60 + "\n")

# List repositories
try:
    repos = ecr_client.describe_repositories()
    print("✅ All repositories:")
    for repo in repos['repositories']:
        print(f"  - {repo['repositoryName']}: {repo['repositoryUri']}")
except Exception as e:
    print(f"❌ Error listing repositories: {e}")
