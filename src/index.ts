import chalk from 'chalk';
import { Plugin } from 'vite';

const recommendedRules: Record<string, number> = {
  // 100 - YOU MUST NOT
  jquery: 100,

  // 10 - YOU SHOULD AVOID
  moment: 10,

  // 1 - YOU HAVE BETTER CHOICES
  lodash: 1,
};

export const packageNameRegex =
  /^.*(?:\/node_modules\/)((@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*)/;

export interface ShitOptions {
  /**
   * When reach this thresh hold, abort building
   * @default 100
   */
  threshold?: number;
  /**
   * Use recommended shit rules
   * @default false
   */
  recommended?: boolean;
  /**
   * Define custom shit rules
   */
  rules?: Record<string, number>;
}

interface Stat {
  pkg: string;
  score: number;
  location: string[];
}

export default function shit({ threshold = 100, recommended, rules = {} }: ShitOptions): Plugin {
  const stats: Record<string, Stat> = {};
  const allRules = recommended ? { ...recommendedRules, ...rules } : { ...rules };
  return {
    name: 'vite:shit',
    moduleParsed: (moduleInfo) => {
      moduleInfo.importedIds.forEach((id) => {
        const pkg = id.match(packageNameRegex)?.[1];
        if (pkg && allRules[pkg]) {
          const stat = stats[pkg];
          if (!stat) {
            stats[pkg] = { pkg, score: allRules[pkg] || 0, location: [moduleInfo.id] };
          } else {
            stat.score += allRules[pkg] || 0;
            stat.location.push(moduleInfo.id);
          }
        }
      });
    },
    closeBundle() {
      if (Object.keys(stats).length === 0) return;

      console.log();

      Object.values(stats).forEach((stat) => {
        console.log(
          '💩',
          chalk.yellow(stat.pkg),
          chalk.red(`${allRules[stat.pkg]} * ${stat.location.length} = ${stat.score}`)
        );
        stat.location.forEach((location) => {
          console.log('   -', location);
        });
        console.log();
      });

      const totalScore = Object.values(stats).reduce((p, c) => p + c.score, 0);
      if (totalScore >= threshold) {
        this.error(`💩 shit overloaded! (shit score: ${totalScore}, threshold: ${threshold})`);
      }
    },
  };
}
