# Jenkins Installation and Setup Guide

This guide provides step-by-step instructions for installing and configuring Jenkins on Ubuntu/Debian systems.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Initial Configuration](#initial-configuration)
- [User Permissions Setup](#user-permissions-setup)
- [Verification](#verification)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Ubuntu/Debian-based Linux system
- Sudo/root access
- Internet connection
- At least 2GB RAM (4GB recommended)
- Java 17 or higher

---

## Installation Steps

### 1. Update System Packages

Update your system to ensure all packages are current:

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Java Development Kit (JDK)

Jenkins requires Java to run. Install OpenJDK 17:

```bash
sudo apt install openjdk-17-jdk -y
```

### 3. Verify Java Installation

Check that Java is installed correctly:

```bash
java -version
```

**Expected output:**
```
openjdk version "17.x.x" ...
```

### 4. Add Jenkins Repository Key

Download and add the Jenkins GPG key:

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
```

### 5. Add Jenkins Repository

Add the Jenkins repository to your system's sources list:

```bash
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
```

### 6. Update Package Index

Update the package index to include Jenkins repository:

```bash
sudo apt update
```

### 7. Install Jenkins

Install Jenkins:

```bash
sudo apt install jenkins -y
```

### 8. Start Jenkins Service

Start the Jenkins service:

```bash
sudo systemctl start jenkins
```

### 9. Enable Jenkins on Boot

Enable Jenkins to start automatically on system boot:

```bash
sudo systemctl enable jenkins
```

### 10. Verify Jenkins Status

Check that Jenkins is running:

```bash
sudo systemctl status jenkins
```

**Expected output:**
```
● jenkins.service - Jenkins Continuous Integration Server
   Loaded: loaded (/lib/systemd/system/jenkins.service; enabled)
   Active: active (running) since ...
```

### 11. Configure Firewall

Allow traffic on port 8080 (Jenkins default port):

```bash
sudo ufw allow 8080
sudo ufw reload
```

---

## Initial Configuration

### 1. Access Jenkins Web Interface

Open your web browser and navigate to:

```
http://localhost:8080
```

Or if accessing remotely:
```
http://your-server-ip:8080
```

### 2. Unlock Jenkins

Retrieve the initial admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Steps:**
1. Copy the password from the terminal
2. Paste it into the Jenkins web interface
3. Click "Continue"

### 3. Install Plugins

Choose **"Install Suggested Plugins"**

This will install commonly used plugins including:
- Git plugin
- Pipeline plugin
- GitHub integration
- Docker plugin
- And many more...

Wait for the installation to complete (this may take a few minutes).

### 4. Create Admin User

Fill in the admin user details:
- **Username**: Your desired username
- **Password**: Strong password
- **Full Name**: Your full name
- **Email**: Your email address

Click "Save and Continue"

### 5. Instance Configuration

Configure the Jenkins URL (usually auto-detected):
```
http://localhost:8080/
```

Click "Save and Finish"

### 6. Jenkins is Ready!

Click "Start using Jenkins" to access the dashboard.

---

## User Permissions Setup

If you need Jenkins to access specific directories or work with your user files:

### 1. Check Current User Groups

```bash
groups manish
```

Replace `manish` with your actual username.

### 2. Add Jenkins to User Group

Add the Jenkins user to your user's group:

```bash
sudo usermod -aG manish jenkins
```

Replace `manish` with your actual username.

### 3. Set Directory Permissions

Grant read/write/execute permissions to the group:

```bash
sudo chmod -R 775 /home/manish/code/jenkins_setup/source
```

Replace the path with your actual project directory.

### 4. Restart Jenkins

Restart Jenkins to apply the changes:

```bash
sudo systemctl restart jenkins
```

---

## Verification

### Check Jenkins Service Status

```bash
sudo systemctl status jenkins
```

### Check Jenkins Logs

```bash
sudo journalctl -u jenkins -f
```

### Test Web Access

```bash
curl http://localhost:8080
```

---

## Screenshots

The following screenshots are available in the repository:
- `jenkins-setup-step1.png` - Initial unlock screen
- `jenkins-setup-step2.png` - Plugin installation
- `jenkins-setup-step3.png` - Admin user creation

---

## Troubleshooting

### Jenkins Won't Start

**Check logs:**
```bash
sudo journalctl -u jenkins -xe
```

**Check port availability:**
```bash
sudo netstat -tulpn | grep 8080
```

### Permission Denied Errors

**Fix Jenkins home directory permissions:**
```bash
sudo chown -R jenkins:jenkins /var/lib/jenkins
```

### Port 8080 Already in Use

**Change Jenkins port:**
1. Edit Jenkins configuration:
   ```bash
   sudo nano /etc/default/jenkins
   ```
2. Change `HTTP_PORT=8080` to another port (e.g., `HTTP_PORT=8081`)
3. Restart Jenkins:
   ```bash
   sudo systemctl restart jenkins
   ```

### Firewall Blocking Access

**Check firewall status:**
```bash
sudo ufw status
```

**Allow Jenkins port:**
```bash
sudo ufw allow 8080/tcp
sudo ufw reload
```

---

## Useful Commands

### Service Management

```bash
# Start Jenkins
sudo systemctl start jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Check status
sudo systemctl status jenkins

# View logs
sudo journalctl -u jenkins -f
```

### Configuration Files

- **Jenkins Home**: `/var/lib/jenkins`
- **Configuration**: `/etc/default/jenkins`
- **Logs**: `/var/log/jenkins/jenkins.log`
- **Service File**: `/lib/systemd/system/jenkins.service`

---

## Next Steps

After installation, you can:

1. **Create your first job** - Set up a build pipeline
2. **Configure credentials** - Add GitHub, Docker Hub, etc.
3. **Install additional plugins** - Manage Jenkins → Manage Plugins
4. **Set up webhooks** - Automate builds on code push
5. **Configure build agents** - Scale your CI/CD infrastructure

---

## Additional Resources

- [Official Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Plugins Index](https://plugins.jenkins.io/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Jenkins Best Practices](https://www.jenkins.io/doc/book/pipeline/best-practices/)

---

## Security Recommendations

1. **Change default admin password** immediately after setup
2. **Enable HTTPS** for production environments
3. **Configure authentication** (LDAP, Active Directory, etc.)
4. **Set up authorization** with role-based access control
5. **Keep Jenkins updated** regularly
6. **Use credentials plugin** for sensitive data
7. **Enable CSRF protection** (enabled by default)
8. **Regular backups** of Jenkins home directory

---

## License

This guide is provided as-is for educational and reference purposes.

---

**Last Updated**: 2025-12-12
**Jenkins Version**: Latest stable (2.x)
**OS**: Ubuntu/Debian

