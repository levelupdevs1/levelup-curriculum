import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Code,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  Play,
  Star,
  Zap,
  Target,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import styles from "./Landing.module.css";

const Landing = () => {
  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Code Your Future,
                <br />
                <span className={styles.heroHighlight}>Earn Your Rewards</span>
              </h1>
              <p className={styles.heroDescription}>
                The only platform where learning to code pays you back. Master
                programming skills, build real projects, and earn while you
                learn.
              </p>
              <div className={styles.heroActions}>
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    Start Coding Free
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                {/* <Link to="/courses">
                  <Button variant="outline" size="lg">
                    <Play size={20} />
                    Explore Courses
                  </Button>
                </Link> */}
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.codeVisual}>
                <div className={styles.codeWindow}>
                  <div className={styles.codeHeader}>
                    <div className={styles.codeDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className={styles.codeTitle}>learning.js</div>
                  </div>
                  <div className={styles.codeContent}>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKeyword}>const</span>
                      <span className={styles.codeVariable}> future</span>
                      <span className={styles.codeOperator}>=</span>
                      <span className={styles.codeString}>"coding"</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKeyword}>const</span>
                      <span className={styles.codeVariable}> rewards</span>
                      <span className={styles.codeOperator}>=</span>
                      <span className={styles.codeNumber}>1000</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKeyword}>if</span>
                      <span className={styles.codeOperator}>(</span>
                      <span className={styles.codeVariable}>future</span>
                      <span className={styles.codeOperator}>===</span>
                      <span className={styles.codeString}>"coding"</span>
                      <span className={styles.codeOperator}>)</span>
                      <span className={styles.codeOperator}>{"{"}</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeIndent}> </span>
                      <span className={styles.codeFunction}>earnRewards</span>
                      <span className={styles.codeOperator}>(</span>
                      <span className={styles.codeVariable}>rewards</span>
                      <span className={styles.codeOperator}>)</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeOperator}>{"}"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>How Level Up Works</h2>
            <p>Three simple steps to transform your coding journey</p>
          </div>
          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <BookOpen size={28} />
              </div>
              <div className={styles.stepContent}>
                <h3>Learn</h3>
                <p>
                  Follow structured, project-based courses designed by industry
                  experts
                </p>
              </div>
            </div>
            <div className={styles.stepConnector}></div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <Users size={28} />
              </div>
              <div className={styles.stepContent}>
                <h3>Build</h3>
                <p>
                  Create real projects and get feedback from our supportive
                  community
                </p>
              </div>
            </div>
            <div className={styles.stepConnector}></div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <Award size={28} />
              </div>
              <div className={styles.stepContent}>
                <h3>Earn</h3>
                <p>
                  Get rewarded with EXP, coins, and certificates for your
                  achievements
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose Level Up?</h2>
            <p>Built for developers, by developers</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Zap size={24} />
              </div>
              <h3>Learn by Building</h3>
              <p>
                Hands-on projects that teach you real-world skills, not just
                theory
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Target size={24} />
              </div>
              <h3>Clear Path</h3>
              <p>
                Structured learning paths that take you from beginner to
                job-ready
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <h3>Community First</h3>
              <p>
                Learn alongside thousands of developers in our supportive
                community
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <TrendingUp size={24} />
              </div>
              <h3>Track Progress</h3>
              <p>
                Visual progress tracking and skill assessments keep you
                motivated
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Active Learners</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Courses Available</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>95%</div>
              <div className={styles.statLabel}>Success Rate</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>Community Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2>Ready to Code Your Future?</h2>
              <p>
                Join thousands of developers who are already building their
                careers with Level Up
              </p>
              <div className={styles.ctaFeatures}>
                <div className={styles.ctaFeature}>
                  <CheckCircle size={20} />
                  <span>100% Free to start</span>
                </div>
                <div className={styles.ctaFeature}>
                  <CheckCircle size={20} />
                  <span>No credit card required</span>
                </div>
                <div className={styles.ctaFeature}>
                  <CheckCircle size={20} />
                  <span>Start coding in minutes</span>
                </div>
              </div>
            </div>
            <div className={styles.ctaAction}>
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Start Learning Now
                  <ArrowRight size={20} />
                </Button>
              </Link>
              {/* <Link to="/courses" className={styles.browseLink}>
                Or browse courses first
              </Link> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
