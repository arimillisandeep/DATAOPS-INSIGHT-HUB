import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFound() {
  return (
    <div className="notfound-page">
      <p className="notfound-code">404</p>
      <h2 className="notfound-title">Page not found</h2>
      <p className="notfound-text">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <Icon name="dashboard" size={16} />
        Go to Dashboard
      </Link>
    </div>
  );
}
