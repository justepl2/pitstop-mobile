import React from 'react';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import EmptyState from '../../components/ui/EmptyState';

export default function MaintenancesScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader
        title="Historique des entretiens"
        subtitle="Les entretiens et prochains rappels s'afficheront ici."
      />
      
      <EmptyState
        title="Fonctionnalité en développement"
        message="La gestion des entretiens sera bientôt disponible. Vous pourrez enregistrer vos maintenances et recevoir des rappels."
      />
    </ScreenContainer>
  );
}
