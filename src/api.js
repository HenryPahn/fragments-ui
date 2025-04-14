// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: {
        ...user.authorizationHeaders(),
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragment ids', { data });

    const fragmentIds = data.fragments;
    return fragmentIds;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

export async function getFragmentData(user, fragmentId) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: {
        ...user.authorizationHeaders(),
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('Content-Type');
    let data;

    if (contentType.startsWith('text/') || contentType.startsWith('application/yaml')) {
      data = await res.text();
    } else if (contentType.startsWith('application/json')) {
      data = await res.json();
    } else {
      data = await res.blob();
    }

    console.log('Successfully got user fragment data', { fragmentData: data });

    return data;
  } catch (err) {
    console.error(`Unable to call GET /v1/fragment/${fragmentId}`, { err });
  }
}

export async function getFragmentMetaData(user, fragmentId) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}/info`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: {
        ...user.authorizationHeaders(),
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragment metadata', { fragmentMetaData: data });
    return data.fragment;
  } catch (err) {
    console.error(`Unable to call GET /v1/fragment/${fragmentId}/info`, { err });
  }
}

export async function getAllFragmentData(user, fragmentIds) {
  try {
    let res = [];
    for(const id of fragmentIds) {
      const fragmentMetaData = await getFragmentMetaData(user, id);
      const fragmentData = await getFragmentData(user, id);
      fragmentMetaData.data = fragmentData
      res.push(fragmentMetaData);
    }

    console.log('Successfully got all user fragment data', { fragments: res });
    return res;
  } catch(err) {
    console.error(`Unable to GET all fragment data`, { err })
  }
}

export async function createFragment(user, contentType, fragmentData) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: {
        ...user.authorizationHeaders(contentType),
      },
      body: fragmentData,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('New fragment is successfully created', { data });
    return data;
  } catch (err) {
    console.error('Unable to call POST /v1/fragment', { err });
  }
}

export async function deleteFragment(user, fragmentId) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: "DELETE",
      headers: {
        ...user.authorizationHeaders(),
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    console.log('Successfully delete user fragment');
    return true;
  } catch (err) {
    console.error(`Unable to call DELETE /v1/fragments/${fragmentId}`, { err });
  }
}

export async function updateFragment(user, fragmentId, contentType, fragmentData) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: "PUT",
      headers: {
        ...user.authorizationHeaders(contentType),
      },
      body: fragmentData,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Fragment is successfully updated', { data });
    return data;
  } catch (err) {
    console.error(`Unable to call PUT /v1/fragments/${fragmentId}`, { err });
  }
}

export async function convertFragment(user, fragmentId, ext) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}.${ext}`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: {
        ...user.authorizationHeaders(),
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('Content-Type');
    let data;

    if (contentType.startsWith('text/') || contentType.startsWith('application/yaml') || contentType.startsWith('application/yml')) {
      data = await res.text();
    } else if (contentType.startsWith('application/json')) {
      data = await res.json();
    } else {
      data = await res.blob();
    }

    console.log('Successfully convert fragment', { convertedData: data });

    return data;
  } catch (err) {
    console.error(`Unable to call GET /v1/fragment/${fragmentId}.${ext}`, { err });
  }
}