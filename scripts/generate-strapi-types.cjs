const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

async function generateTypes() {
  const strapiUrl = process.env.STRAPI_URL;
  const strapiToken = process.env.STRAPI_TOKEN;
  const outputPath = process.argv[2] || 'src/types/strapi-generated.ts';

  if (!strapiUrl || !strapiToken) {
    console.error('Error: STRAPI_URL and STRAPI_TOKEN environment variables are required.');
    process.exit(1);
  }

  try {
    console.log('Connecting to Strapi to fetch schemas...');
    
    const response = await axios.get(`${strapiUrl}/api/content-type-builder/content-types`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });

    const schemas = response.data.data;

    if (!schemas || !Array.isArray(schemas)) {
      throw new Error('No schemas array returned from Strapi. Expected response.data.data to be an array.');
    }

    console.log(`Successfully fetched ${schemas.length} schemas.`);

    let typesContent = '// Generated by scripts/generate-strapi-types.cjs\n// Do not edit this file manually.\n\n';

    for (const schema of schemas) {
      if (schema.schema.kind !== 'collectionType') {
        continue;
      }

      const interfaceName = schema.schema.displayName.replace(/[\s-]+/g, '');

      typesContent += `export interface ${interfaceName} {\n`;
      typesContent += `  id: number;\n`;
      typesContent += `  attributes: {\n`;

      for (const attr in schema.schema.attributes) {
        const attribute = schema.schema.attributes[attr];
        let tsType = 'any';
        switch (attribute.type) {
          case 'string':
          case 'text':
          case 'email':
          case 'password':
          case 'richtext':
          case 'uid':
            tsType = 'string';
            break;
          case 'integer':
          case 'biginteger':
          case 'float':
          case 'decimal':
            tsType = 'number';
            break;
          case 'date':
          case 'datetime':
          case 'time':
            tsType = 'string';
            break;
          case 'boolean':
            tsType = 'boolean';
            break;
          case 'relation':
            tsType = attribute.relation === 'oneToMany' || attribute.relation === 'manyToMany' ? 'any[]' : 'any';
            break;
          case 'component':
            tsType = 'any';
            break;
          case 'media':
            tsType = attribute.multiple ? 'any[]' : 'any';
            break;
          case 'json':
            tsType = 'any';
            break;
        }
        typesContent += `    ${attr}: ${tsType};\n`;
      }
      typesContent += `  }\n`;
      typesContent += '}\n\n';
    }

    await fs.writeFile(path.resolve(outputPath), typesContent);
    console.log(`Successfully generated types at ${outputPath}`);

  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error('Failed to generate Strapi types:', errorMessage);
    process.exit(1);
  }
}

generateTypes();