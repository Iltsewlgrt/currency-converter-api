import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Currency Converter API',
      version: '1.0.0',
      description: 'API для конвертации валют',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Local server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            base_currency: { type: 'string', example: 'USD' },
            favorites: { type: 'array', items: { type: 'string' }, example: ['EUR', 'GBP'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/api/currencies': {
        get: {
          summary: 'Получить список поддерживаемых валют',
          description: 'Возвращает массив кодов валют (ISO4217). Кэшируется на 1 час.',
          responses: {
            200: {
              description: 'Успешный ответ',
              content: {
                'application/json': { schema: { type: 'array', items: { type: 'string' } } },
              },
            },
          },
        },
      },
      '/api/rates': {
        get: {
          summary: 'Получить курсы валют',
          description:
            'Возвращает курсы переданных валют относительно базовой. Кэшируется в БД на 24 часа.',
          parameters: [
            {
              name: 'base',
              in: 'query',
              schema: { type: 'string' },
              description: 'Базовая валюта (если нет, берется из настроек юзера)',
            },
            {
              name: 'targets',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Целевые валюты через запятую (например EUR,GBP)',
            },
          ],
          responses: {
            200: {
              description: 'Успешный ответ',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      base: { type: 'string' },
                      rates: { type: 'object', additionalProperties: { type: 'number' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/user': {
        get: {
          summary: 'Получить настройки пользователя',
          description: 'Возвращает настройки текущего пользователя по куке user_id.',
          responses: {
            200: {
              description: 'Настройки пользователя',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
          },
        },
        post: {
          summary: 'Обновить настройки пользователя',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    base_currency: { type: 'string', example: 'EUR' },
                    favorites: { type: 'array', items: { type: 'string' }, example: ['GBP'] },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Обновленные настройки',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
