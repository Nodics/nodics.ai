/* Nodics - governed by the repository LICENSE. */
/**
 * @module cms/utils/currentRecordHeads
 * @description Selects unambiguous logical heads from an already authorized complete CMS record set.
 * @owner cms
 * @layer utils
 * @override Preserve version validity and never choose an older active record after filtering.
 */
module.exports = function currentRecordHeads(rows) {
    const groups = new Map();
    if (!Array.isArray(rows)) throw new TypeError('CMS history is not a complete record array');
    for (const row of rows) {
        if (!row || typeof row.code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(row.code))
            throw new TypeError('CMS history has an invalid logical identity');
        const items = groups.get(row.code) || [];
        items.push(row);
        groups.set(row.code, items);
    }
    return [...groups.values()].map(items => {
        if (items.some(item => item.versionId !== undefined && (!Number.isSafeInteger(item.versionId) || item.versionId < 0)) ||
            items.length > 1 && items.some(item => item.versionId === undefined) ||
            new Set(items.map(item => item.versionId)).size !== items.length)
            throw new TypeError('CMS history has ambiguous or invalid versions');
        return items.reduce((head, item) => (item.versionId || 0) > (head.versionId || 0) ? item : head);
    }).sort((left, right) => left.code.localeCompare(right.code));
};
