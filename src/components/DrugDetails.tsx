import React from 'react';
import { DrugInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pill, Info, AlertTriangle, FlaskConical, Activity, ClipboardList, Clock, Users, Tablets, Table as TableIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface DrugDetailsProps {
  drug: DrugInfo;
}

export const DrugDetails: React.FC<DrugDetailsProps> = ({ drug }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden border-none shadow-xl">
        <CardHeader className="bg-primary/5 pb-2">
          <Badge className="w-fit mb-2 bg-primary/90 text-white backdrop-blur-md">Medicine Information</Badge>
          <CardTitle className="text-3xl font-bold text-primary uppercase">{drug.name}</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-8 p-8 md:grid-cols-2">
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center gap-2 text-primary">
                <FlaskConical className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-wider text-xs">Medical Formula</h3>
              </div>
              <p className="text-lg font-mono font-medium leading-relaxed text-primary">
                {drug.medicalFormula}
              </p>
            </section>

            <Separator />

            <section>
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Pill className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-wider text-xs">Original Formula</h3>
              </div>
              <p className="text-lg font-medium leading-relaxed text-foreground/90">
                {drug.originalFormula}
              </p>
            </section>

            <Separator />

            {drug.mechanismOfAction && (
              <>
                <section>
                  <div className="mb-3 flex items-center gap-2 text-primary">
                    <Activity className="h-5 w-5" />
                    <h3 className="font-semibold uppercase tracking-wider text-xs">Mechanism of Action</h3>
                  </div>
                  <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {drug.mechanismOfAction}
                  </p>
                </section>
                <Separator />
              </>
            )}

            <section>
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-wider text-xs">General Information</h3>
              </div>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {drug.information}
              </p>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Activity className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-wider text-xs">Usage</h3>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {drug.usage}
              </p>
            </section>
          </div>

          <div className="space-y-4">
            {(drug.sideEffects?.length || 0) > 0 || (drug.contraindications?.length || 0) > 0 ? (
              <section className="rounded-xl bg-destructive/5 p-4 border border-destructive/10">
                <div className="mb-2 flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold uppercase tracking-wider text-xs">Safety Warnings</h3>
                </div>
                <div className="space-y-3">
                  {(drug.sideEffects?.length || 0) > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-destructive/70 uppercase mb-1">Side Effects</h4>
                      <ul className="grid grid-cols-1 gap-1">
                        {drug.sideEffects?.map((effect, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-destructive/80">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive/40" />
                            {effect}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(drug.contraindications?.length || 0) > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-destructive/70 uppercase mb-1">Contraindications</h4>
                      <ul className="grid grid-cols-1 gap-1">
                        {drug.contraindications?.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-destructive/80">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {(drug.interactions?.length || 0) > 0 && (
              <section className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                <div className="mb-2 flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold uppercase tracking-wider text-xs">Interactions</h3>
                </div>
                <ul className="grid grid-cols-1 gap-1">
                  {drug.interactions?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-xl bg-primary/5 p-6 border border-primary/10">
              <div className="mb-4 flex items-center gap-2 text-primary">
                <ClipboardList className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-wider text-xs">Precautions & Dosage</h3>
              </div>
              <div className="space-y-4">
                {drug.precautions && (
                  <div>
                    <h4 className="text-xs font-bold text-primary/70 uppercase mb-1">Precautions</h4>
                    <p className="text-sm text-muted-foreground">{drug.precautions}</p>
                  </div>
                )}
                {drug.form && (
                  <div>
                    <h4 className="text-xs font-bold text-primary/70 uppercase mb-1">Medication Form</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                        <Tablets className="mr-1 h-3 w-3" />
                        {drug.form}
                      </Badge>
                    </div>
                  </div>
                )}
                {drug.ageGroup && (
                  <div>
                    <h4 className="text-xs font-bold text-primary/70 uppercase mb-1">Recommended Age (Years)</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                        <Users className="mr-1 h-3 w-3" />
                        {drug.ageGroup}
                      </Badge>
                    </div>
                  </div>
                )}
                {drug.frequency && (
                  <div>
                    <h4 className="text-xs font-bold text-primary/70 uppercase mb-1">Dosage Times</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                        <Clock className="mr-1 h-3 w-3" />
                        {drug.frequency}
                      </Badge>
                    </div>
                  </div>
                )}
                <div className="pt-4">
                  <div className="mb-3 flex items-center gap-2 text-primary">
                    <TableIcon className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase">Dosage Reference Table</h4>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-primary/10 bg-white/50 shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-primary/5 text-xs font-bold uppercase text-primary/70">
                        <tr>
                          <th className="px-3 py-2">Age Group</th>
                          <th className="px-3 py-2">Medication Form</th>
                          <th className="px-3 py-2 text-right">Dosage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/5">
                        {drug.dosageTable.map((row, idx) => (
                          <tr key={idx} className="hover:bg-primary/[0.02] transition-colors">
                            <td className="px-3 py-2.5 font-medium text-foreground">{row.ageGroup}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{row.form}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-primary">{row.dosage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
