// ============================================================================
// KillSwitch.swf — Día de los Muertos Flash Cemetery & Ofrenda Altar
// ============================================================================

import { gemmaGhost } from '../ai/GemmaGhost';
import { sound } from '../engine/Audio';

export class CemeteryManager {
  private activeGrave: string | null = null;
  private isGenerating: boolean = false;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    const graveCards = document.querySelectorAll('.grave-card');
    graveCards.forEach(card => {
      card.addEventListener('click', () => {
        const game = card.getAttribute('data-game');
        if (game) {
          this.selectGrave(game, card as HTMLElement);
        }
      });
    });
  }

  public selectGrave(gameTitle: string, element: HTMLElement) {
    if (this.isGenerating) return;

    sound.playBypass();

    // Toggle active state
    document.querySelectorAll('.grave-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');

    this.activeGrave = gameTitle;
    this.isGenerating = true;

    const titleEl = document.getElementById('calaverita-subject');
    const contentEl = document.getElementById('calaverita-content');

    if (titleEl) {
      titleEl.innerText = `🕯️ IN MEMORY OF: ${gameTitle.toUpperCase()} 🕯️`;
    }
    if (contentEl) {
      contentEl.innerHTML = `<em>Consulting Google Gemma 3:4B spirit matrix for ${gameTitle}...</em>`;
    }

    gemmaGhost.generateCalaverita(
      gameTitle,
      (textChunk) => {
        if (contentEl) {
          contentEl.innerText = textChunk;
        }
      },
      () => {
        this.isGenerating = false;
      }
    );
  }
}
