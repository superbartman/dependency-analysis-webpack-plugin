const fs = require('fs');
const path = require('path');

interface OptionsProps {
  entry?: string;
  include?: string[];
  exclude?: string[];
  isDelete?: boolean;
}

class DependencyAnalysisWebpackPlugin {
  options: OptionsProps;
  allFiles: string[];
  dependenciesFiles: string[];
  uselessFiles: string[];

  constructor(options = {}) {
    this.options = options;
    this.allFiles = [];
    this.dependenciesFiles = [];
    this.uselessFiles = [];
    this.init();
  }

  init() {
    console.log('[dependency-analysis-webpack-plugin] start');
    this.allFiles = this.readAllFiles();
  }

  readAllFiles() {
    let allFiles = this.readFiles(this.options.entry ?? 'src');
    allFiles = this.handleInclude(allFiles);
    allFiles = this.handleExclude(allFiles);
    return allFiles;
  }

  readFiles(path: string) {
    let allFiles = [];
    const curPath = this.resolvePath(path);
    const files = fs.readdirSync(curPath);
    for (const file of files) {
      const obj = fs.statSync(this.resolvePath(`${path}/${file}`));
      if (obj.isDirectory()) {
        allFiles = [...allFiles, ...this.readFiles(`${path}/${file}`)];
      } else {
        // .gitkeep
        // *.d.ts
        // .md
        const match =
          new RegExp(/^\./).test(file) ||
          new RegExp(/\.md$/).test(file) ||
          new RegExp(/\.d.ts$/).test(file);
        if (!match) {
          allFiles.push(this.resolvePath(`${path}/${file}`));
        }
      }
    }
    return allFiles;
  }

  resolvePath(pathname = '') {
    return path.join(path.resolve('./'), pathname);
  }

  handleInclude(list: string[]) {
    if (!this.options.include) {
      return list;
    }
    const includeList = [];
    this.options.include.forEach((item) => {
      includeList.push(this.resolvePath(item));
    });
    const filterFile = list.filter((item) => {
      const index = includeList.findIndex((el) => item.indexOf(el) > -1);
      if (index > -1) {
        return item;
      }
    });
    return filterFile;
  }

  handleExclude(list: string[]) {
    if (!this.options.exclude) {
      return list;
    }
    const excludeList = [];
    this.options.exclude.forEach((item) => {
      excludeList.push(this.resolvePath(item));
    });
    const filterFile = list.filter((item) => {
      const index = excludeList.findIndex((el) => item.indexOf(el) > -1);
      if (index == -1) {
        return item;
      }
    });
    return filterFile;
  }

  writeFile() {
    let content = `All File: ${this.allFiles.length}, Dependency File: ${this.dependenciesFiles.length}, Useless File: ${this.uselessFiles.length}\r\n`;
    content += `\r\nAll File List: \r\n${this.allFiles.join('\n')}\r\n`;
    content += `\r\nDependency File List: \r\n${this.dependenciesFiles.join(
      '\n',
    )}\r\n`;
    content += `\r\nUseless File List: \r\n${this.uselessFiles.join('\n')}\r\n`;
    fs.writeFile('dependency.txt', content, (err: Error) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(
        '[dependency-analysis-webpack-plugin] dependency.txt file has been written',
      );
      if (this.options.isDelete) {
        this.deleteUselessFiles();
      }
    });
  }

  deleteUselessFiles() {
    this.uselessFiles.forEach((item) => {
      fs.unlink(item, (err: Error) => {
        if (err) throw err;
      });
    });
    console.log(
      '[dependency-analysis-webpack-plugin] useless files have been deleted',
    );
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync(
      'DependencyAnalysisWebpackPlugin',
      (factory) => {
        let curFile = [];
        factory.compilation.fileDependencies.forEach((item: string) => {
          curFile.push(item);
        });
        curFile = curFile.filter((item) => {
          if (
            item.indexOf('node_modules') == -1 &&
            item.indexOf(this.resolvePath(this.options.entry ?? 'src')) > -1
          ) {
            return item;
          }
        });
        curFile = this.handleInclude(curFile);
        curFile = this.handleExclude(curFile);
        this.dependenciesFiles = curFile;
        this.allFiles.forEach((item) => {
          if (this.dependenciesFiles.findIndex((el) => el == item) == -1) {
            this.uselessFiles.push(item);
          }
        });
        this.writeFile();
      },
    );
  }
}

module.exports = DependencyAnalysisWebpackPlugin;
