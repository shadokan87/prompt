import Prompt, {load} from "./Prompt";

function main() {
   const articles = [
        { name: "Vintage Denim Jacket", price: 89.99, category: "Outerwear" },
        { name: "Cotton V-Neck Tee", price: 24.99, category: "Tops" },
        { name: "Slim Fit Chinos", price: 59.99, category: "Pants" },
        { name: "Wool Blend Sweater", price: 79.99, category: "Knitwear" },
        { name: "Classic Oxford Shirt", price: 44.99, category: "Shirts" }
    ];
    Prompt.pathAlias = {
        browse: "prompts",
        refund: "prompts/refund"
    }
    const articlesPrompt = new Prompt(load("@refund/shopRefund.md"), {articles: articles});
    console.log(articlesPrompt.value);
}
main();