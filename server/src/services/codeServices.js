const Docker = require("dockerode");
const docker = new Docker();
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const imageMap = {
  python: "python:3.9-slim",
  java: "openjdk:17-slim",
  javascript: "node:18-alpine",
  cpp: "gcc:latest",
  c: "gcc:latest",
};

const containerResourceLimits = {
  Memory: 100 * 1024 * 1024, // 100MB memory limit
  CpuShares: 512, // CPU shares (relative weight)
};

const executeCode = async (language, code) => {
  if (!imageMap[language]) {
    logger.error(`Unsupported language: ${language}`);
    throw new Error("Unsupported language");
  }

  const containerId = uuidv4();
  let container;

  try {
    let command;
    switch (language) {
      case "python":
        command = ["python3", "-c", code];
        break;

      case "javascript":
        command = ["node", "-e", code];
        break;

      case "java":
        command = [
          "sh",
          "-c",
          `echo '${code.replace(/'/g, "'\\''")}' > Main.java && javac Main.java && java Main`,
        ];
        break;

      case "cpp":
        command = [
          "sh",
          "-c",
          `echo '${code.replace(/'/g, "'\\''")}' > main.cpp && g++ main.cpp -o main && ./main`,
        ];
        break;

      case "c":
        command = [
          "sh",
          "-c",
          `echo '${code.replace(/'/g, "'\\''")}' > main.c && gcc main.c -o main && ./main`,
        ];
        break;

      default:
        throw new Error("Language not supported");
    }

    container = await docker.createContainer({
      Image: imageMap[language],
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
      HostConfig: {
        ...containerResourceLimits,
        AutoRemove: true,
      },
      name: `code-execution-${containerId}`,
    });

    await container.start();
    logger.info(`Container started for language: ${language}, ID: ${containerId}`);

    const stream = await container.logs({ stdout: true, stderr: true, follow: true });

    return new Promise((resolve, reject) => {
      let output = "";
      stream.on("data", (chunk) => {
        output += chunk.toString();
      });
      stream.on("end", () => {
        logger.info(`Container execution completed for ID: ${containerId}`);
        resolve(output);
      });
      stream.on("error", (err) => {
        logger.error(`Container stream error for ID: ${containerId}: ${err}`);
        reject(err);
      });
    });
  } catch (error) {
    logger.error(`Error executing code for language: ${language}, ID: ${containerId}: ${error}`);
    throw new Error("Failed to execute code");
  } finally {
    if (container) {
      try {
        await container.remove();
        logger.info(`Container removed for ID: ${containerId}`);
      } catch (err) {
        logger.error(`Failed to remove container for ID: ${containerId}: ${err}`);
      }
    }
  }
};

module.exports = { executeCode };