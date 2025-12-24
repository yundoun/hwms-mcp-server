/**
 * HWMS MCP Server Configuration
 * Registers all MCP tools and handles communication via stdio
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { listModules, listModulesSchema } from './tools/listModules.js';
import { resolveDependencies, resolveDependenciesSchema } from './tools/resolveDependencies.js';
import { generateScaffold, generateScaffoldSchema } from './tools/generateScaffold.js';

export async function createServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'hwms-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool listing handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'list_modules',
          description: '사용 가능한 모듈 목록을 조회합니다. 하이브리드 웹앱 개발에 사용할 수 있는 검증된 모듈들의 이름, 카테고리, 설명을 반환합니다.',
          inputSchema: listModulesSchema,
        },
        {
          name: 'resolve_dependencies',
          description: '선택된 모듈들의 의존성을 자동으로 해결합니다. 필요한 의존 모듈을 추가하고, 충돌을 검사하며, 환경 변수와 설정 단계를 반환합니다.',
          inputSchema: resolveDependenciesSchema,
        },
        {
          name: 'generate_scaffold',
          description: '선택된 모듈들로 프로젝트 구조를 생성합니다. 프로젝트 디렉토리, 모듈 파일, package.json, README.md 등을 자동으로 생성합니다.',
          inputSchema: generateScaffoldSchema,
        },
      ],
    };
  });

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'list_modules': {
          const result = await listModules(args?.category as string | undefined);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'resolve_dependencies': {
          const modules = args?.modules as string[];
          if (!modules || !Array.isArray(modules)) {
            throw new Error('modules 파라미터가 필요합니다 (문자열 배열)');
          }
          const result = await resolveDependencies(modules);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'generate_scaffold': {
          const projectName = args?.projectName as string;
          const modules = args?.modules as string[];
          if (!projectName || typeof projectName !== 'string') {
            throw new Error('projectName 파라미터가 필요합니다');
          }
          if (!modules || !Array.isArray(modules)) {
            throw new Error('modules 파라미터가 필요합니다 (문자열 배열)');
          }
          const result = await generateScaffold(projectName, modules);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        default:
          throw new Error(`알 수 없는 도구: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `오류: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  return server;
}
