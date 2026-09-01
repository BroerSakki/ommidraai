# Ommidraai
---

## Linux (Debian based)

### Setup
1. Set up docker and git
```bash
set -e

echo " Setting up Docker"
echo "=="

echo "Updating system..."
echo "---"
sudo apt update
sudo apt upgrade -y
echo "---"

echo "Installing prerequisites..."
echo "---"
sudo apt install -y git curl
echo "---"

echo "Installing Docker..."
echo "---"
curl -fsSL https://get.docker.com | sudo sh
echo "---"

echo "Enabling Docker..."
echo "---"
sudo systemctl enable --now docker
echo "---"

echo "Adding $USER to the docker group..."
echo "---"
sudo usermod -aG docker "$USER"
echo "---"

echo "=="
echo
echo "Docker installation complete!"
echo
echo "Docker version:"
echo "---"
sudo docker --version
echo "---"

echo
echo "Docker Compose version:"
echo "---"
sudo docker compose version
echo "---"

echo
echo "IMPORTANT:"
echo "Please log out and log back in before continuing."
echo
echo "After logging back in, test Docker with:"
echo "    docker run hello-world"
```
2. Log out, then back in, or reboot
3. Download the project
```bash
git clone https://github.com/BroerSakki/ommidraai.git
cd ommidraai
```
4. Start the program
```bash
docker compose up -d --build
```
---

## Windows

### Setup

### Requirements

Before installing the application, make sure you have:

* Windows 10 or Windows 11
* Git
* Docker Desktop

### 1. Install Git

Download and install Git for Windows from the official website:

[Git for Windows](https://git-scm.com/download/win?utm_source=chatgpt.com)

The default installation options are suitable for this project.

You can verify that Git was installed by opening **PowerShell** and running:

```powershell
git --version
```

### 2. Install Docker Desktop

Download and install Docker Desktop:

[Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/?utm_source=chatgpt.com)

During installation, use the **WSL 2** backend when prompted.

After installation, start Docker Desktop and wait until Docker reports that it is running.

You can verify the installation from PowerShell:

```powershell
docker --version
docker compose version
```

### 3. Download the project

Open **PowerShell** and clone the repository:

```powershell
git clone https://github.com/USERNAME/PROJECT.git
cd PROJECT
```

### 4. Start the application

From the project directory, run:

```powershell
docker compose up -d --build
```

Docker will download the required images, build the application containers, and start the services.

### 5. Access the application

Once the containers have started, open the application in your web browser:

```text
http://localhost:3000
```

### Stopping the application

To stop the application without removing the containers:

```powershell
docker compose stop
```

To stop and remove the containers:

```powershell
docker compose down
```

To start the application again:

```powershell
docker compose up -d
```

