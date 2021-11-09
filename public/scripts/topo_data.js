let GetRouteById = (topoData, id) => {
  for( let route of topoData.routes ) {
    if( route.id == id ) return route;
  }
  return null;
}

let GetPreviousRoute = (topoData, route) => {
  if( route == null ) return null;
  let previousRoute = null;
  topoData.routes.reduce((previous, current) => {
    if( current.id == route.id ) previousRoute = previous;
    return current;
  });
  return previousRoute;
}

let GetNextRoute = (topoData, route) => {
  if( route == null ) return null;
  let nextRoute = null;
  topoData.routes.reduce((previous, current) => {
    if( previous.id == route.id ) nextRoute = current;
    return current;
  });
  return nextRoute;
}

let SwapRoutes = (topoData, firstRoute, secondRoute) => {
  if( firstRoute == null || secondRoute == null ) return;
  topoData.routes = topoData.routes.map(route => {
    switch (route.id) {
      case firstRoute.id:
        return secondRoute;
      case secondRoute.id:
        return firstRoute;
      default:
        return route;
    }
  });
}

let UpdateRouteById = (topoData, newRoute) => {
  const newRoutes = topoData.routes.map(route => {
    return (route.id == newRoute.id) ? newRoute : route;
  });
}
