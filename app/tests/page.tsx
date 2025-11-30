/**
 * Page de tests IA pour validation des produits
 * Accessible uniquement en développement
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, CheckCircle2, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { beautySampleProducts, runBeautyProductTests, generateTestReport, type TestResult } from '@/lib/tests/beautyProducts';
import { useAuth } from '@/contexts/AuthContext';

export default function TestsPage() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState('');

  const runTests = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour lancer les tests');
      return;
    }

    setRunning(true);
    setResults([]);
    setProgress(0);
    setReport('');

    try {
      const token = await user.getIdToken();
      const testResults: TestResult[] = [];

      for (let i = 0; i < beautySampleProducts.length; i++) {
        const product = beautySampleProducts[i];
        const startTime = Date.now();

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              productName: product.name,
              brand: product.brand,
              category: product.category,
            }),
          });

          const data = await response.json();
          const duration = Date.now() - startTime;
          const confidenceScore = data.data?.confidenceScore || 0;
          const success = Math.abs(confidenceScore - product.expectedConfidence) <= 15;

          const result: TestResult = {
            product,
            actual: {
              confidenceScore,
              correctedBrand: data.data?.correctedBrand,
              correctedProductName: data.data?.correctedProductName,
              message: data.data?.message,
            },
            success,
            duration,
          };

          testResults.push(result);
          setResults([...testResults]);
          setProgress(((i + 1) / beautySampleProducts.length) * 100);

        } catch (error) {
          const duration = Date.now() - startTime;
          testResults.push({
            product,
            actual: {
              confidenceScore: 0,
              message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
            },
            success: false,
            duration,
          });
        }
      }

      setReport(generateTestReport(testResults));

    } catch (error) {
      console.error('Test error:', error);
      alert('Erreur lors des tests');
    } finally {
      setRunning(false);
    }
  };

  const passedCount = results.filter(r => r.success).length;
  const failedCount = results.length - passedCount;
  const avgConfidence = results.length > 0
    ? results.reduce((sum, r) => sum + r.actual.confidenceScore, 0) / results.length
    : 0;

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tests IA - Validation Pipeline</h1>
        <p className="text-gray-600">
          Tests automatisés avec {beautySampleProducts.length} produits beauté réels
        </p>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{beautySampleProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Réussis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{passedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Échecs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Score Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{avgConfidence.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Lancer les Tests</CardTitle>
          <CardDescription>
            Teste le pipeline de génération avec 15 produits réels (Dior, Chanel, Lancôme, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {running && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Test en cours...</span>
                <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            onClick={runTests}
            disabled={running || !user}
            className="w-full"
            size="lg"
          >
            {running ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Lancer les Tests
              </>
            )}
          </Button>

          {!user && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous devez être connecté pour lancer les tests
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <h4 className="font-semibold">
                          {result.product.name} - {result.product.brand}
                        </h4>
                        <p className="text-sm text-gray-600">{result.product.notes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.actual.confidenceScore}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{result.duration}ms</p>
                    </div>
                  </div>

                  {result.actual.correctedProductName && (
                    <div className="text-sm text-blue-600 mt-2">
                      ✏️ Correction: {result.actual.correctedProductName}
                    </div>
                  )}

                  {result.actual.message && (
                    <div className="text-sm text-gray-600 mt-1">
                      💬 {result.actual.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Rapport Détaillé</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap">
              {report}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
