export class AppState {
  constructor() {
    this._state = {
      activeSection: null,
      loadedSections: new Set(),
      isLoading: false,
      errors: [],
      analytics: {
        pageViews: {},
        interactions: []
      }
    };
    
    this._listeners = new Set();
  }

  setState(newState) {
    this._state = { ...this._state, ...newState };
    this._notifyListeners();
  }

  getState() {
    return { ...this._state };
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notifyListeners() {
    this._listeners.forEach(listener => listener(this._state));
  }

  // Section Management
  setActiveSection(sectionId) {
    this.setState({ activeSection: sectionId });
    this.trackPageView(sectionId);
  }

  addLoadedSection(sectionId) {
    const loadedSections = new Set(this._state.loadedSections);
    loadedSections.add(sectionId);
    this.setState({ loadedSections });
  }

  // Loading State
  setLoading(isLoading) {
    this.setState({ isLoading });
  }

  // Error Handling
  addError(error) {
    const errors = [...this._state.errors, error];
    this.setState({ errors });
  }

  clearErrors() {
    this.setState({ errors: [] });
  }

  // Analytics
  trackPageView(sectionId) {
    const pageViews = {
      ...this._state.analytics.pageViews,
      [sectionId]: (this._state.analytics.pageViews[sectionId] || 0) + 1
    };
    this.setState({
      analytics: {
        ...this._state.analytics,
        pageViews
      }
    });
  }

  trackInteraction(type, data) {
    const interactions = [
      ...this._state.analytics.interactions,
      { type, data, timestamp: new Date().toISOString() }
    ];
    this.setState({
      analytics: {
        ...this._state.analytics,
        interactions
      }
    });
  }
} 