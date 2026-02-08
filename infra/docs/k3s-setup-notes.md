# K3s Setup Notes

This document records the steps used to install and configure **K3s** along with **Docker** and **Ingress NGINX**.

## 1. Install K3s

### Base Command (From Official Docs)

Reference:
[https://docs.k3s.io/quick-start#install-script](https://docs.k3s.io/quick-start#install-script)

```
curl -sfL https://get.k3s.io | sh -
```

### Modified Command Used

```
curl -sfL https://get.k3s.io | sh -s - --docker --disable=traefik
```

### Why These Modifications Were Required

#### Enable Docker

- K3s uses **containerd** by default.
- To use Docker as the container runtime, the `--docker` flag must be passed.

Reference:
[https://docs.k3s.io/advanced#using-docker-as-the-container-runtime](https://docs.k3s.io/advanced#using-docker-as-the-container-runtime)

#### Disable Traefik

- K3s installs **Traefik** as the default ingress controller.
- Since this setup uses **Ingress NGINX**, Traefik must be disabled to avoid conflicts.

Reference:
[https://docs.k3s.io/installation/packaged-components#disabling-manifests](https://docs.k3s.io/installation/packaged-components#disabling-manifests)

## 2. K3s Configuration

After installation:

- K3s creates configuration files inside:

```
/etc/rancher/k3s
```

- The Kubernetes config file is:

```
/etc/rancher/k3s/k3s.yaml
```

This file must be provided to `kubectl`.

## 3. Configure kubectl Access

### Add KUBECONFIG Environment Variable

Add the following to `~/.bashrc`:

```
# kubectl context
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

### Fix Permission Issues

The configuration directory is owned by `root`, which prevents normal user access.

Run:

```
sudo chown -R faheem /etc/rancher/k3s/
```

### Reload Shell

Restart the shell or run:

```
source ~/.bashrc
```

## 4. Install Ingress NGINX

Install using Helm:

```
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

Reference:
[https://kubernetes.github.io/ingress-nginx/deploy/](https://kubernetes.github.io/ingress-nginx/deploy/)

## 5. Update Hosts Mapping (Minikube → K3s Migration)

Previously, when using **Minikube**, the `/etc/hosts` file contained:

```
192.168.49.2 stew.stew
```

Minikube runs Kubernetes inside a VM, so the service domain pointed to the VM IP.

Since **K3s runs directly on the local machine**, the mapping must be updated to:

```
127.0.0.1 stew.stew
```

### Apply Change

Edit `/etc/hosts`:

```
sudo nano /etc/hosts
```

Replace the Minikube IP entry with the localhost entry shown above.

## 6. Verification

Ensure the shell session contains the correct `KUBECONFIG` variable.

```
echo $KUBECONFIG
```

You can also verify cluster connectivity:

```
kubectl get nodes
```

## 7. Development Workflow

After completing setup:

```
skaffold dev
```

Runs successfully with this configuration.

## Notes / Gotchas

- Forgetting to disable Traefik will cause ingress conflicts.
- Forgetting to update folder ownership prevents `kubectl` from working.
- Hosts file must be updated when migrating from Minikube.
- Always reload the shell after updating environment variables.

Uninstall K3s:

```
/usr/local/bin/k3s-uninstall.sh
```

Reference:
[https://docs.k3s.io/quick-start#install-script](https://docs.k3s.io/quick-start#install-script)
