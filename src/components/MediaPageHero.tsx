import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface MediaHeroStat {
  icon?: React.ReactNode;
  label: string;
}

export interface MediaHeroAction {
  label: string;
  to?: string;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export interface MediaPageHeroProps {
  icon: React.ReactNode;
  badge: string;
  title: string;
  accent: string;
  subtitle: string;
  backdropImage: string;
  backdropPosition?: string;
  stats?: MediaHeroStat[];
  actions?: MediaHeroAction[];
}

/**
 * Shared atmospheric dark cinema hero banner used on Photos, Videos, and Reels pages.
 */
const MediaPageHero: React.FC<MediaPageHeroProps> = ({
  icon,
  badge,
  title,
  accent,
  subtitle,
  backdropImage,
  backdropPosition = 'center 28%',
  stats = [],
  actions = [],
}) => {
  return (
    <header className="mph-hero">
      {/* Atmospheric photographic backdrop */}
      <img
        src={backdropImage}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="mph-backdrop-img"
        style={{ objectPosition: backdropPosition }}
      />
      <div className="mph-scrim" aria-hidden="true" />
      <div className="mph-glow mph-glow--rose" aria-hidden="true" />
      <div className="mph-glow mph-glow--amber" aria-hidden="true" />

      <div className="mph-inner">
        <div className="mph-top-row">
          <div className="mph-icon">{icon}</div>
          <div className="mph-badge">
            <span>{badge}</span>
          </div>
        </div>

        <h1 className="mph-title">
          {title} <span className="mph-accent">{accent}</span>
        </h1>

        <p className="mph-sub">{subtitle}</p>

        {stats.length > 0 && (
          <div className="mph-stats" aria-label="Highlights">
            {stats.map(stat => (
              <div key={stat.label} className="mph-stat-pill">
                {stat.icon && <span className="mph-stat-icon">{stat.icon}</span>}
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {actions.length > 0 && (
          <div className="mph-actions">
            {actions.map(action => {
              const cls = `mph-btn ${action.variant === 'secondary' ? 'mph-btn--secondary' : 'mph-btn--primary'}`;
              const content = (
                <>
                  {action.icon}
                  <span>{action.label}</span>
                  {action.variant !== 'secondary' && <ArrowRight size={15} />}
                </>
              );

              if (action.href) {
                return (
                  <a
                    key={action.label}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                    onClick={action.onClick}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={action.label}
                  to={action.to ?? '/contact'}
                  className={cls}
                  onClick={action.onClick}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default MediaPageHero;
