'use client';

import { CreatePredictionForm } from '@/components/CreatePredictionForm';

export default function CreatePage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Prediction</h1>
        <p className="text-gray-600">Set up a new head-to-head prediction and wait for an opponent</p>
      </div>

      <CreatePredictionForm />
    </div>
  );
}
