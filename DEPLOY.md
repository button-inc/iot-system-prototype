sign into ghcr
`echo <GH Personal Accesss Token> | docker login ghcr.io -u mikevespi  --password-stdin`
create docker secret
`kubectl create secret docker-registry ghcr-login-secret --docker-server=https://ghcr.io --docker-username=$YOUR_GITHUB_USERNAME --docker-password=$YOUR_GITHUB_TOKEN --docker-email=$YOUR_EMAIL`
