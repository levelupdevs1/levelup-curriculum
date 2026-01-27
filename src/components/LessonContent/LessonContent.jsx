import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import Card from "../Card/Card";
import styles from "./LessonContent.module.css";

const LessonContent = ({ lesson }) => {
  return (
    <Card className={styles.lessonCard}>
      <h1>{lesson.title}</h1>

      {/* Render objectives if available */}
      {lesson.objectives?.length > 0 && (
        <div className={styles.objectives}>
          <h3>Learning Objectives</h3>
          <ul>
            {lesson.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Render markdown content */}
      {lesson.content && (
        <div className={styles.markdownContent}>
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </div>
      )}

      {/* Render key takeaways */}
      {lesson.keyTakeaways?.length > 0 && (
        <div className={styles.takeaways}>
          <h3>Key Takeaways</h3>
          <ul>
            {lesson.keyTakeaways.map((takeaway, index) => (
              <li key={index}>{takeaway}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Render external resources */}
      {lesson.externalResources?.length > 0 && (
        <div className={styles.resources}>
          <h3>Additional Resources</h3>
          <ul>
            {lesson.externalResources.map((resource, index) => (
              <li key={index}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.title}
                </a>
                {resource.description && (
                  <p className={styles.resourceDescription}>
                    {resource.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

LessonContent.propTypes = {
  lesson: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    objectives: PropTypes.arrayOf(PropTypes.string),
    keyTakeaways: PropTypes.arrayOf(PropTypes.string),
    externalResources: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
      }),
    ),
  }).isRequired,
};

export default LessonContent;
