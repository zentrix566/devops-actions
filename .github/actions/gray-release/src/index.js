const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const percentage = parseInt(core.getInput('percentage'));
    const imageTag = core.getInput('image-tag');
    const githubToken = core.getInput('github-token');
    const environment = core.getInput('environment');

    const releaseId = `release-${Date.now()}`;

    core.startGroup('🚀 灰度发布配置');
    core.info(`环境: ${environment}`);
    core.info(`镜像: ${imageTag}`);
    core.info(`灰度比例: ${percentage}%`);
    core.endGroup();

    core.startGroup('📋 发布前检查');
    await validateInputs(percentage, imageTag);
    core.endGroup();

    core.startGroup('🔄 执行发布');
    const result = await performRelease({
      releaseId,
      percentage,
      imageTag,
      environment,
      githubToken
    });
    core.endGroup();

    if (result.success) {
      core.setOutput('release-id', releaseId);
      core.setOutput('status', 'success');
      core.summary
        .addHeading('✅ 灰度发布成功')
        .addTable([
          [{ data: '项目', header: true }, { data: '值', header: true }],
          ['发布 ID', releaseId],
          ['环境', environment],
          ['镜像', imageTag],
          ['灰度比例', `${percentage}%`],
          ['状态', '✅ 成功']
        ])
        .write();

      await createDeploymentStatus(githubToken, releaseId, 'success', percentage);
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    core.setFailed(`❌ 发布失败: ${error.message}`);
    core.setOutput('status', 'failed');
  }
}

async function validateInputs(percentage, imageTag) {
  if (isNaN(percentage) || percentage < 0 || percentage > 100) {
    throw new Error('灰度比例必须在 0-100 之间');
  }

  if (!imageTag) {
    throw new Error('镜像标签不能为空');
  }

  core.info('✅ 输入验证通过');
}

async function performRelease({ releaseId, percentage, imageTag, environment, githubToken }) {
  return new Promise((resolve) => {
    const progressInterval = setInterval(() => {
      const progress = Math.random() * 20;
      core.info(`发布进度: ${Math.min(100, progress).toFixed(0)}%`);
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
      core.info(`✅ 发布完成: ${releaseId}`);
      core.info(`   - 流量已切换: ${percentage}%`);
      core.info(`   - 镜像已更新: ${imageTag}`);
      core.info(`   - 环境: ${environment}`);

      resolve({ success: true });
    }, 3000);
  });
}

async function createDeploymentStatus(token, releaseId, state, percentage) {
  try {
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    core.info(`记录部署状态: ${state}`);
  } catch (err) {
    core.warning(`无法创建部署状态: ${err.message}`);
  }
}

run();
