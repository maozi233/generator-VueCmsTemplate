const Generator = require('yeoman-generator');
const path = require('path');
const chalk = require('chalk');

module.exports = class extends Generator {
  prompting() {
    const pkg = this.destinationPath('./package.json');
    const dirName = path.basename(this.destinationPath());
    const prompts = [];
    if (!this.fs.exists(pkg)) {
      prompts.push({
        type: 'input',
        name: 'appName',
        default: dirName,
        message: '请输入项目名',
      })
    }
    return this.prompt(prompts).then((answers) => {
      this.answers = answers;
    });
  }

  install() {
    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false,
    });
  }

  writing() {
    // 从nodemodule里面返回到根目录
    const srcRoot = path.resolve(__dirname, '../../app');
    this.sourceRoot(srcRoot);

    this.spawnCommandSync(`git`, ['init'], {
      cwd: this.destinationPath('./'),
    });

    this.fs.copy(
      path.resolve(srcRoot, '**'),
      this.destinationPath('./'),
      {
        globOptions: {
          dot: true,
          ignore: [
            '**/dist/**',
            path.resolve(srcRoot, 'package.json'),
          ],
        },
      },
    );
    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore')
    )
    if (!this.fs.exists(this.destinationPath('package.json'))) {
      this.fs.copy(
        this.templatePath('package.json'),
        this.destinationPath('package.json'),
        {
          process: (contents) => {
            const contentsStr = contents.toString();
            const { appName } = this.answers;
            return contentsStr
              .replace(/\{\{appName\}\}/g, appName)
              .replace(/"version":.*/g, '"version": "1.0.0",');
          },
        }
      );
    }
  }

  end() {
    this.log('\n', chalk.bold('安装完毕'));
  }
}