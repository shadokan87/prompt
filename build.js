import { execSync } from "child_process";
import { rmSync, existsSync } from "fs";
import { build } from "esbuild";

async function buildProject() {
    console.log("🧹 Cleaning dist directory...");
    
    // Clean dist directory
    if (existsSync("dist")) {
        rmSync("dist", { recursive: true, force: true });
    }

    console.log("🔨 Building with esbuild...");

    // Build with esbuild
    try {
        await build({
            entryPoints: ["./index.ts"],
            outdir: "./dist",
            platform: "node",
            format: "esm",
            sourcemap: true,
            minify: false,
            splitting: false,
            bundle: false,
            target: "node18",
        });
    } catch (error) {
        console.error("❌ Build failed:");
        console.error(error);
        process.exit(1);
    }

    console.log("📦 Generating TypeScript declarations...");
    
    // Generate TypeScript declarations
    try {
        execSync("tsc --declaration --declarationDir dist --emitDeclarationOnly --skipLibCheck --moduleResolution bundler --module esnext --target esnext --noEmit false", {
            stdio: "inherit"
        });
        console.log("✅ Build completed successfully!");
    } catch (error) {
        console.error("❌ TypeScript declaration generation failed:");
        console.error(error);
        process.exit(1);
    }
}

buildProject().catch((error) => {
    console.error("❌ Build failed:", error);
    process.exit(1);
});