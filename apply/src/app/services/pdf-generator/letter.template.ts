import { UserProfile } from 'src/app/features/profile/models/user-profile.model';
import { Candidature } from 'src/app/features/candidatures/models/candidature.model';

export function getFrenchCoverLetterHtml(
    userProfile: UserProfile,
    candidature: Candidature,
    letterBody: string
): string {
    const today = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const city = userProfile.adresse?.split(',').pop()?.trim().replace(/[0-9]/g, '').trim() || 'Votre ville';

    const letterBodyHtml = `
        <p style="margin: 0 0 1em 0;">Madame, Monsieur,</p>
        ${letterBody
            .split('\n')
            .filter(p => p.trim() !== '')
            .map(p => `<p style="margin: 0 0 1em 0; text-align: justify;">${p.trim()}</p>`)
            .join('')
        }
        <p style="margin: 3em 0 1em 0;">Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>
    `;

    return `
        <div id="letter-render-temp" style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #000; width: 210mm; height: 297mm; box-sizing: border-box; padding: 15mm;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20mm;">
                <tbody>
                    <tr>
                        <td style="vertical-align: top; width: 50%;">
                            <div style="font-weight: bold;">${userProfile.prenom || ''} ${userProfile.nom || ''}</div>
                            <div>${userProfile.adresse || ''}</div>
                            <div>${userProfile.telephone || ''}</div>
                            <div>${userProfile.email || ''}</div>
                        </td>
                        <td style="vertical-align: top; width: 50%; text-align: left; padding-left: 20mm;">
                            <div style="font-weight: bold;">${candidature.entreprise || 'Entreprise'}</div>
                            ${candidature.contactRecruteur?.nom ? `<div>À l'attention de ${candidature.contactRecruteur.nom}</div>` : '<div>Service des Ressources Humaines</div>'}
                            <div>${candidature.lieuTravail || 'Adresse de l\'entreprise'}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style="text-align: right; margin-bottom: 10mm;">
                Fait à ${city}, le ${today}
            </div>

            <div style="margin-bottom: 10mm;">
                <span style="font-weight: bold;">Objet :</span> Candidature au poste de ${candidature.intitulePoste || 'votre offre d\'emploi'}
            </div>

            <div class="letter-body">
                ${letterBodyHtml}
            </div>
        </div>
    `;
}