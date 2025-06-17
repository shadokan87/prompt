# Prompt

The best way to work and manage prompts in JavaScript/TypeScript. Universal and library-agnostic, Prompt works with your favorite SDK such as Vercel's AI SDK, Openai SDK, langchain, Openai api and more

## Features

- Create prompts from strings or files
- Variable interpolation using `{{variable}}` syntax
- File-based prompts with path aliasing
- Type-safe variable handling
- Code block-aware templating

## Installation

```bash
npm install prompt-templating
```

## Usage

### Using with Strings

```typescript
import Prompt from 'prompt-templating';

// Basic AI instruction template
const assistantTemplate = `You are a {{role}} assistant. Your task is to {{task}}.`;
const assistantPrompt = new Prompt(assistantTemplate, {
    role: 'technical',
    task: 'explain complex programming concepts in simple terms'
});
console.log(assistantPrompt.value);
// Output: You are a technical assistant. Your task is to explain complex programming concepts in simple terms.

// Complex prompt with context and examples
const codeReviewTemplate = `As a code reviewer, analyze the following {{language}} code:
{{codeSnippet}}

Consider these aspects:
- Code style and best practices
- Potential bugs or issues
- Performance implications
- Security concerns

Programming language: {{language}}
Experience level: {{experienceLevel}}`

const codeReviewPrompt = new Prompt(codeReviewTemplate, {
    language: 'TypeScript',
    codeSnippet: 'function add(a: number, b: number) { return a + b }',
    experienceLevel: 'intermediate'
});
console.log(codeReviewPrompt.value);
// Output:
// As a code reviewer, analyze the following TypeScript code:
// function add(a: number, b: number) { return a + b }
//
// Consider these aspects:
// - Code style and best practices
// - Potential bugs or issues
// - Performance implications
// - Security concerns
//
// Programming language: TypeScript
// Experience level: intermediate
```

### Using with Files

```typescript
import Prompt, { load } from 'prompt-templating';

// Content of prompts/shopBrowser.md:
/*
You are an AI shopping assistant helping customers browse products.

Customer Information:
- Name: {{customerName}}
- Previous purchases: {{previousPurchases}}
- Preferred categories: {{preferences}}

Available products in {{category}}:
{{productList}}

Task: Help the customer find products based on their preferences and purchase history.
Consider factors like:
1. Price range
2. Style preferences
3. Previous buying patterns
4. Current seasonal trends

Remember to maintain a helpful and professional tone.
*/

// Load prompt from a file
const shoppingPrompt = new Prompt(load('./prompts/shopBrowser.md'), {
    customerName: 'Sarah',
    previousPurchases: ['Denim Jacket', 'Summer Dress'],
    preferences: ['Casual Wear', 'Sustainable Fashion'],
    category: 'Summer Collection',
    productList: [
        'Organic Cotton T-shirt',
        'Linen Shorts',
        'Bamboo Sundress'
    ]
});
```

### Using with Path Aliases

```typescript
import Prompt, { load } from 'prompt-templating';

// Define path aliases for better organization
Prompt.pathAlias = {
    templates: 'prompts/templates',
    refund: 'prompts/refund'
};

// Content of prompts/refund/shopRefund.md:
/*
You are a customer service AI handling a refund request.

Order Details:
- Order ID: {{orderId}}
- Purchase Date: {{purchaseDate}}
- Items: {{items}}
- Refund Reason: {{reason}}

Customer History:
- Previous Orders: {{orderHistory}}
- Customer Since: {{customerSince}}

Instructions:
1. Review the refund request details
2. Check the return policy compliance
3. Analyze customer purchase history
4. Provide a response following company guidelines

Generate a professional and empathetic response to the customer's refund request.
*/

const refundHandler = new Prompt(load('@refund/shopRefund.md'), {
    orderId: 'ORD-123',
    purchaseDate: '2025-06-10',
    items: ['Premium Headphones', 'Wireless Charger'],
    reason: 'Product not as described',
    orderHistory: '5 orders in last 6 months',
    customerSince: '2024'
});

console.log(refundHandler.value);
```

## Features

- **Variable Interpolation**: Use `{{variableName}}` syntax
- **File Loading**: Load prompts from files with `load()`
- **Path Aliases**: Define shortcuts for commonly used paths
- **Type Safety**: Built with TypeScript for type-safe variables
- **Error Handling**: Clear errors for missing variables

## Documentation

For detailed documentation and examples, visit our [GitHub repository](https://github.com/yourusername/prompt-templating).

## License

MIT