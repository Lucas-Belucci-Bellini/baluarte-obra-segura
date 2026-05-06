import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Clear existing data
await connection.execute('DELETE FROM materialStores');
await connection.execute('DELETE FROM materials');
await connection.execute('DELETE FROM knowledgeBaseArticles');
await connection.execute('DELETE FROM categories');
await connection.execute('DELETE FROM stores');

// Insert categories
const categoriesData = [
  { namePortuguese: 'Elétrica', nameEnglish: 'Electrical', icon: '⚡' },
  { namePortuguese: 'Estrutural', nameEnglish: 'Structural', icon: '🏗️' },
  { namePortuguese: 'Hidráulica', nameEnglish: 'Hydraulic', icon: '💧' },
  { namePortuguese: 'Fundações', nameEnglish: 'Foundations', icon: '🔨' },
  { namePortuguese: 'Ferramentas', nameEnglish: 'Tools', icon: '🔧' },
  { namePortuguese: 'Acabamentos', nameEnglish: 'Finishes', icon: '🎨' },
];

const categoryIds = {};
for (const cat of categoriesData) {
  const [result] = await connection.execute(
    'INSERT INTO categories (namePortuguese, nameEnglish, icon) VALUES (?, ?, ?)',
    [cat.namePortuguese, cat.nameEnglish, cat.icon]
  );
  categoryIds[cat.namePortuguese] = result.insertId;
}

// Insert stores
const storesData = [
  { namePortuguese: 'Loja A', nameEnglish: 'Store A' },
  { namePortuguese: 'Loja B', nameEnglish: 'Store B' },
  { namePortuguese: 'Loja C', nameEnglish: 'Store C' },
  { namePortuguese: 'Loja D', nameEnglish: 'Store D' },
];

const storeIds = [];
for (const store of storesData) {
  const [result] = await connection.execute(
    'INSERT INTO stores (namePortuguese, nameEnglish) VALUES (?, ?)',
    [store.namePortuguese, store.nameEnglish]
  );
  storeIds.push(result.insertId);
}

// Insert materials
const materialsData = [
  {
    categoryId: categoryIds['Elétrica'],
    namePortuguese: 'Conduíte Flexível PVC',
    nameEnglish: 'Flexible PVC Conduit',
    descriptionPortuguese: 'Proteção obrigatória para fiação elétrica em paredes e lajes',
    descriptionEnglish: 'Mandatory protection for electrical wiring in walls and slabs',
    riskLevel: 'RISCO_ALTO',
    safetyWarningsPortuguese: 'Deve ser instalado de forma segura para evitar danos à fiação',
    safetyWarningsEnglish: 'Must be installed safely to prevent wiring damage',
    usageTipsPortuguese: 'Use em todas as passagens de fios elétricos',
    usageTipsEnglish: 'Use in all electrical wire passages',
    storeCount: 4,
  },
  {
    categoryId: categoryIds['Elétrica'],
    namePortuguese: 'Fio 2,5 mm² Flexível',
    nameEnglish: 'Flexible 2.5 mm² Wire',
    descriptionPortuguese: 'O padrão para tomadas e circuitos de 20 A em residências',
    descriptionEnglish: 'Standard for outlets and 20 A circuits in residential buildings',
    riskLevel: 'RISCO_ALTO',
    safetyWarningsPortuguese: 'Verificar capacidade de corrente antes de usar',
    safetyWarningsEnglish: 'Check current capacity before use',
    usageTipsPortuguese: 'Ideal para circuitos de tomadas em cozinhas e banheiros',
    usageTipsEnglish: 'Ideal for outlet circuits in kitchens and bathrooms',
    storeCount: 4,
  },
  {
    categoryId: categoryIds['Elétrica'],
    namePortuguese: 'Disjuntor Monopolar 20 A',
    nameEnglish: 'Single-pole Breaker 20 A',
    descriptionPortuguese: 'Proteção essencial para circuitos de tomadas residenciais',
    descriptionEnglish: 'Essential protection for residential outlet circuits',
    riskLevel: 'RISCO_ALTO',
    safetyWarningsPortuguese: 'Nunca exceda a corrente nominal do disjuntor',
    safetyWarningsEnglish: 'Never exceed the breaker rated current',
    usageTipsPortuguese: 'Use em todos os circuitos de tomadas',
    usageTipsEnglish: 'Use in all outlet circuits',
    storeCount: 4,
  },
  {
    categoryId: categoryIds['Estrutural'],
    namePortuguese: 'Cimento Portland CP II',
    nameEnglish: 'Portland Cement CP II',
    descriptionPortuguese: 'O cimento mais usado em obras residenciais comuns no Brasil',
    descriptionEnglish: 'Most commonly used cement in residential construction in Brazil',
    riskLevel: 'ATENCAO',
    safetyWarningsPortuguese: 'Usar proteção ao manusear - pode causar irritação na pele',
    safetyWarningsEnglish: 'Use protection when handling - can cause skin irritation',
    usageTipsPortuguese: 'Armazenar em local seco e protegido da umidade',
    usageTipsEnglish: 'Store in a dry place protected from moisture',
    storeCount: 4,
  },
  {
    categoryId: categoryIds['Estrutural'],
    namePortuguese: 'Areia Média',
    nameEnglish: 'Medium Sand',
    descriptionPortuguese: 'Agregado essencial para concreto e argamassa',
    descriptionEnglish: 'Essential aggregate for concrete and mortar',
    riskLevel: 'NORMAL',
    safetyWarningsPortuguese: 'Proteger os olhos ao manusear',
    safetyWarningsEnglish: 'Protect eyes when handling',
    usageTipsPortuguese: 'Usar em proporção adequada com cimento',
    usageTipsEnglish: 'Use in proper proportion with cement',
    storeCount: 4,
  },
  {
    categoryId: categoryIds['Hidráulica'],
    namePortuguese: 'Tubo PVC 25mm',
    nameEnglish: 'PVC Pipe 25mm',
    descriptionPortuguese: 'Tubo de PVC para instalações hidráulicas',
    descriptionEnglish: 'PVC pipe for hydraulic installations',
    riskLevel: 'NORMAL',
    safetyWarningsPortuguese: 'Não usar em água quente acima de 60°C',
    safetyWarningsEnglish: 'Do not use in hot water above 60°C',
    usageTipsPortuguese: 'Cortar com serra apropriada para evitar danos',
    usageTipsEnglish: 'Cut with appropriate saw to prevent damage',
    storeCount: 4,
  },
];

const materialIds = [];
for (const material of materialsData) {
  const [result] = await connection.execute(
    `INSERT INTO materials (categoryId, namePortuguese, nameEnglish, descriptionPortuguese, descriptionEnglish, riskLevel, safetyWarningsPortuguese, safetyWarningsEnglish, usageTipsPortuguese, usageTipsEnglish, storeCount) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      material.categoryId,
      material.namePortuguese,
      material.nameEnglish,
      material.descriptionPortuguese,
      material.descriptionEnglish,
      material.riskLevel,
      material.safetyWarningsPortuguese,
      material.safetyWarningsEnglish,
      material.usageTipsPortuguese,
      material.usageTipsEnglish,
      material.storeCount,
    ]
  );
  materialIds.push(result.insertId);
}

// Link materials to stores (each material in 4 stores)
for (let i = 0; i < materialIds.length; i++) {
  for (let j = 0; j < 4; j++) {
    await connection.execute(
      'INSERT INTO materialStores (materialId, storeId) VALUES (?, ?)',
      [materialIds[i], storeIds[j]]
    );
  }
}

// Insert knowledge base articles
const articlesData = [
  {
    titlePortuguese: 'Segurança em Instalações Elétricas',
    titleEnglish: 'Safety in Electrical Installations',
    contentPortuguese: 'Guia completo sobre segurança em instalações elétricas residenciais...',
    contentEnglish: 'Complete guide on safety in residential electrical installations...',
    categoryId: categoryIds['Elétrica'],
    featured: 1,
  },
  {
    titlePortuguese: 'Como Escolher o Cimento Correto',
    titleEnglish: 'How to Choose the Right Cement',
    contentPortuguese: 'Aprenda as diferenças entre os tipos de cimento e quando usá-los...',
    contentEnglish: 'Learn the differences between cement types and when to use them...',
    categoryId: categoryIds['Estrutural'],
    featured: 1,
  },
  {
    titlePortuguese: 'Instalação de Tubulações Hidráulicas',
    titleEnglish: 'Hydraulic Piping Installation',
    contentPortuguese: 'Passo a passo para instalação correta de tubulações...',
    contentEnglish: 'Step by step for correct pipe installation...',
    categoryId: categoryIds['Hidráulica'],
    featured: 0,
  },
];

for (const article of articlesData) {
  await connection.execute(
    `INSERT INTO knowledgeBaseArticles (titlePortuguese, titleEnglish, contentPortuguese, contentEnglish, categoryId, featured) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      article.titlePortuguese,
      article.titleEnglish,
      article.contentPortuguese,
      article.contentEnglish,
      article.categoryId,
      article.featured,
    ]
  );
}

console.log('✅ Database seeded successfully!');
await connection.end();
