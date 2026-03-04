const core = require('@actions/core');
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function run() {
  try {
    const sshHost = core.getInput('ssh-host', { required: true });
    const sshUser = core.getInput('ssh-user', { required: true });
    const sshPass = core.getInput('ssh-pass', { required: true });
    const sshPort = parseInt(core.getInput('ssh-port')) || 22;
    const deployPath = core.getInput('deploy-path', { required: true });
    const dockerImage = core.getInput('docker-image');
    const postDeployScript = core.getInput('post-deploy-script');

    core.startGroup('🚀 SSH 部署配置');
    core.info(`服务器: ${sshHost}:${sshPort}`);
    core.info(`用户: ${sshUser}`);
    core.info(`部署路径: ${deployPath}`);
    if (dockerImage) core.info(`Docker 镜像: ${dockerImage}`);
    core.endGroup();

    core.startGroup('🔐 连接服务器');
    await ssh.connect({
      host: sshHost,
      port: sshPort,
      username: sshUser,
      password: sshPass,
      tryKeyboard: true
    });
    core.info('✅ 连接成功');
    core.endGroup();

    core.startGroup('📦 执行部署');

    // 创建部署目录
    core.info('创建部署目录...');
    await ssh.execCommand(`mkdir -p ${deployPath}`);

    if (dockerImage) {
      core.info(`使用 Docker 镜像: ${dockerImage}`);

      // 拉取镜像
      core.info('拉取 Docker 镜像...');
      await ssh.execCommand(`docker pull ${dockerImage} 2>/dev/null || true`);

      // 停止旧容器
      core.info('停止旧容器...');
      await ssh.execCommand(`docker stop devops-actions 2>/dev/null || true`);
      await ssh.execCommand(`docker rm devops-actions 2>/dev/null || true`);

      // 启动新容器
      core.info('启动新容器...');
      const result = await ssh.execCommand(
        `docker run -d --name devops-actions --restart=always -p 80:80 ${dockerImage}`
      );
      core.info(`容器 ID: ${result.stdout.trim()}`);

    } else {
      core.info('上传应用文件...');
      // 使用 scp 上传文件
      await ssh.putDirectory('app', deployPath, {
        recursive: true,
        tick: (localPath, remotePath, error) => {
          if (error) {
            core.warning(`上传失败: ${localPath} - ${error}`);
          } else {
            core.debug(`上传成功: ${localPath}`);
          }
        }
      });
    }

    // 执行部署后脚本
    if (postDeployScript) {
      core.info('执行部署后脚本...');
      await ssh.execCommand(postDeployScript);
    }

    core.endGroup();

    core.startGroup('✅ 验证部署');
    // 简单验证
    if (dockerImage) {
      const check = await ssh.execCommand('docker ps --filter name=devops-actions --format "{{.Status}}"');
      if (check.stdout.includes('Up')) {
        core.info('容器运行正常');
      } else {
        throw new Error('容器启动失败');
      }
    } else {
      const check = await ssh.execCommand(`ls -la ${deployPath}/index.html`);
      if (check.code === 0) {
        core.info('文件部署成功');
      }
    }
    core.endGroup();

    // 设置输出
    core.setOutput('deploy-status', 'success');

    core.summary
      .addHeading('✅ 部署成功')
      .addTable([
        [{ data: '项目', header: true }, { data: '值', header: true }],
        ['服务器', `${sshHost}:${sshPort}`],
        ['部署路径', deployPath],
        ['Docker 镜像', dockerImage || '不使用'],
        ['状态', '✅ 成功']
      ])
      .write();

  } catch (error) {
    core.setFailed(`❌ 部署失败: ${error.message}`);
    core.setOutput('deploy-status', 'failed');
  } finally {
    ssh.dispose();
  }
}

run();
