import { execFileSync } from 'node:child_process';
import { readFile,writeFile,mkdir,stat } from 'node:fs/promises';
import { zipSync } from 'fflate';
const paths=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const allowed=/^(?:app\/|lib\/|public\/|scripts\/|supabase\/|tests\/|package(?:-lock)?\.json$|next\.config\.ts$|tsconfig\.json$|vercel\.json$|compose\.yaml$|\.gitignore$|\.npmrc$|\.env\.example$|README\.md$|VERCEL\.md$|ASSETS\.md$)/;
const archive={};
for(const name of paths){if(!allowed.test(name))continue;try{if((await stat(name)).isFile())archive['rpm-plataforma/'+name]=new Uint8Array(await readFile(name));}catch{}}
await mkdir('outputs',{recursive:true});await writeFile('outputs/rpm-vercel.zip',zipSync(archive,{level:6}));
console.log(`outputs/rpm-vercel.zip · ${Object.keys(archive).length} archivos · Sin credenciales, datos locales ni dependencias instaladas.`);
