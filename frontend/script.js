const searchBtn = document.getElementById('searchBtn');
const idInput = document.getElementById('idInput');
const result = document.getElementById('result');
const typeSel = document.getElementById('type');
document.getElementById('year').textContent = new Date().getFullYear();

searchBtn.addEventListener('click', doLookup);
idInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLookup(); });

async function doLookup() {
  const id = idInput.value.trim();
  const type = typeSel.value;
  if (!id) { alert('Introduce un ID válido'); return; }
  result.classList.remove('hidden');
  result.innerHTML = `<div class="card"><div class="avatar"></div><div class="info"><h2>Buscando…</h2><p class="small-muted">Consultando API</p></div></div>`;

  try {
    let url = '';
    if (type === 'user') {
      url = `http://localhost:3000/api/user/${encodeURIComponent(id)}`;
    } else if (type === 'guild') {
      url = `http://localhost:3000/api/invite/${encodeURIComponent(id)}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      result.innerHTML = `<div class="card"><div class="avatar"></div><div class="info"><h2>Error</h2><p class="small-muted">${data.error || 'No encontrado'}</p></div></div>`;
      return;
    }

    renderCard(type, data);
  } catch (err) {
    result.innerHTML = `<div class="card"><div class="avatar"></div><div class="info"><h2>Error</h2><p class="small-muted">${err.message}</p></div></div>`;
  }
}

function renderCard(type, data) {
  if (type === 'user') {
    const user = data;

    // Construir URL avatar
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=512`
      : null;

    // Construir URL banner
    const bannerUrl = user.banner
      ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024`
      : null;


    const tags = user.discriminator && user.discriminator !== '0' ? `#${user.discriminator}` : '';
    const badges = user.public_flags && user.public_flags > 0
      ? `<span class="badge">Tiene badges</span>`
      : `<span class="small-muted">No tiene badges públicos</span>`;
    const accent = user.accent_color ? `#${user.accent_color.toString(16).padStart(6, '0')}` : null;
    const bannerColor = user.banner_color || null;
    const primaryGuild = user.primary_guild || 'Not set';
    const clan = user.clan || 'Not set';

    // Fecha de creación y account age
    const creationTimestamp = Number((BigInt(user.id) >> 22n) + 1420070400000n);
    const creationDate = new Date(creationTimestamp);
    const accountAgeMs = Date.now() - creationDate.getTime();
    const accountYears = Math.floor(accountAgeMs / 1000 / 60 / 60 / 24 / 365);
    const accountDays = Math.floor(accountAgeMs / 1000 / 60 / 60 / 24);

    result.innerHTML = `
      <div class="card">
        <div class="avatar">
          ${avatarUrl ? `<img src="${avatarUrl}" alt="avatar">` : '<div class="small-muted">No avatar</div>'}
        </div>
        <div class="info">
          <h2>${escapeHtml(user.username)} ${tags}</h2>
          <p class="small-muted">@${user.username}${tags} · ID: ${user.id}</p>
          <div class="badges">${badges}</div>

          <div class="meta">
            <div class="chip">Primary Guild: ${primaryGuild}</div>
            <div class="chip">Clan: ${clan}</div>
          </div>

          <div style="margin-top:12px">
            <strong>Accent color:</strong> ${accent ? `<code>${accent}</code>` : '<span class="small-muted">Not set</span>'}
          </div>
          <div style="margin-top:8px">
            <strong>Banner color:</strong> ${bannerColor ? `<code>${bannerColor}</code>` : '<span class="small-muted">Not set</span>'}
          </div>

          ${bannerUrl ? `<div class="banner" style="width:580px; height:140px; overflow:hidden; border-radius:8px;">
  <img src="${bannerUrl}" style="width:100%; height:100%; object-fit:cover">
</div>` : ''}


          <div style="margin-top:12px; font-size:13px; color:var(--muted)">
            <strong>Created on:</strong> ${creationDate.toLocaleString()}<br>
            <strong>Account age:</strong> ${accountYears} years (${accountDays} days)
          </div>

          <div style="margin-top:12px; font-size:13px; color:var(--muted)">
            <strong>Technical Details</strong>
            <pre style="white-space:pre-wrap; font-size:12px; color:var(--muted); margin-top:8px; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px;">
ID: ${user.id}
Creation Timestamp: ${creationTimestamp}
Binary Representation: ${BigInt(user.id).toString(2).padStart(64, '0')}
            </pre>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'guild') {
    const g = data;

    const iconUrl = g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=512` : null;
    const bannerUrl = g.banner ? `https://cdn.discordapp.com/banners/${g.id}/${g.banner}.${g.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024` : null;
    const splashUrl = g.splash ? `https://cdn.discordapp.com/splashes/${g.id}/${g.splash}.png?size=1024` : null;

    result.innerHTML = `
    <div class="card">
      <div class="avatar">
        ${iconUrl ? `<img src="${iconUrl}" alt="icon">` : '<div class="small-muted">No icon</div>'}
      </div>
      <div class="info">
        <h2>${escapeHtml(g.name)}</h2>
        <p class="small-muted">ID: ${g.id} · Region: ${g.region || 'Not set'}</p>
        <div class="meta">
          <div class="chip">Members: ${g.approximate_member_count || 'N/A'}</div>
          <div class="chip">Premium Tier: ${g.premium_tier || 0} · Boosts: ${g.premium_subscription_count || 0}</div>
        </div>
        <div style="margin-top:12px" class="small-muted">
          ${g.description || ''}
        </div>
        ${bannerUrl ? `<div class="banner" style="width:580px; height:140px; overflow:hidden; border-radius:8px; margin-top:12px;">
          <img src="${bannerUrl}" style="width:100%; height:100%; object-fit:cover">
        </div>` : ''}
        ${splashUrl ? `<div class="banner" style="width:580px; height:140px; overflow:hidden; border-radius:8px; margin-top:12px;">
          <img src="${splashUrl}" style="width:100%; height:100%; object-fit:cover">
        </div>` : ''}
        <div style="margin-top:12px; font-size:13px; color:var(--muted)">
          <strong>Features:</strong> ${g.features ? g.features.join(', ') : 'N/A'}
        </div>
      </div>
    </div>
  `;
  }
}

function escapeHtml(unsafe) {
  if (!unsafe && unsafe !== 0) return '';
  return String(unsafe).replace(/[&<"'>]/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]);
  });
}
