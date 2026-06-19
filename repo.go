// Command repo is the home for this repository's bespoke, repo-specific logic — the small
// pieces of automation that are too particular to live in a shared tool but want more than
// a tangle of shell in the Taskfile. Each concern is a subcommand; the Taskfile just calls
// `go run repo.go <cmd>`.
//
// tartan-dictionary is a BUILD WORKSPACE, not a source repo: it is overlaid from the
// template (`task sync`) and filled by the weaver (`task tdb`). ownership.yaml is the single
// record of which paths this repo actually owns, and the subcommands below act on it.
//
// Usage (run from the repo root):
//
//	go run repo.go check    audit the ownership contract + the sibling template's sync (read-only)
//	go run repo.go clean    delete everything not owned/preserved — reset to the owned skeleton
//	go run repo.go keep     print the keep-set (owned + preserved + .git) and exit
//
// Stdlib only, so `go run repo.go ...` works with no module or dependencies.
package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strings"
)

const (
	contractPath     = "ownership.yaml"
	templateTaskfile = "../tartan-dictionary-template/Taskfile.yml"
)

// Categories the template's `task sync` must EXCLUDE so an `rsync --delete` overlay never
// clobbers or deletes them. (Anything not in the contract is authored content sync pushes.)
var syncExcluded = []string{"owned", "preserved", "generated", "build_artifact"}

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: repo <check|clean|keep>")
		os.Exit(2)
	}
	c, err := loadContract(contractPath)
	if err != nil {
		fatal("%v", err)
	}
	switch os.Args[1] {
	case "check":
		os.Exit(checkOwnership(c))
	case "clean":
		clean(c)
	case "keep":
		for _, p := range keepSet(c) {
			fmt.Println(p)
		}
	default:
		fatal("unknown command %q (want check|clean|keep)", os.Args[1])
	}
}

func fatal(format string, a ...any) {
	fmt.Fprintf(os.Stderr, "repo: "+format+"\n", a...)
	os.Exit(1)
}

// loadContract parses the contract's simple "key:\n  - item" YAML using only the stdlib —
// the file is hand-kept to that shape, so a full YAML library would be overkill.
func loadContract(path string) (map[string][]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("%s missing — cannot read the ownership contract: %w", path, err)
	}
	defer f.Close()

	out := map[string][]string{}
	var key string
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := sc.Text()
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		switch {
		case strings.HasPrefix(line, " ") && strings.HasPrefix(trimmed, "- "):
			// list item under the current top-level key
			v := strings.TrimSpace(strings.TrimPrefix(trimmed, "-"))
			if i := strings.Index(v, " #"); i >= 0 { // strip trailing comment
				v = strings.TrimSpace(v[:i])
			}
			v = strings.Trim(v, `"'`)
			if v != "" && key != "" {
				out[key] = append(out[key], v)
			}
		case !strings.HasPrefix(line, " ") && strings.HasSuffix(trimmed, ":"):
			// top-level "key:" line
			key = strings.TrimSuffix(trimmed, ":")
		}
	}
	return out, sc.Err()
}

// keepSet is what `clean` preserves: the owned + preserved paths, plus .git unconditionally.
func keepSet(c map[string][]string) []string {
	keep := map[string]bool{".git": true}
	for _, cat := range []string{"owned", "preserved"} {
		for _, p := range c[cat] {
			keep[p] = true
		}
	}
	out := make([]string, 0, len(keep))
	for p := range keep {
		out = append(out, p)
	}
	sort.Strings(out)
	return out
}

// checkOwnership validates the contract and audits the template sync against it; returns an exit code.
func checkOwnership(c map[string][]string) int {
	fail := false

	// 1. The categories must be disjoint — a path may not be claimed twice.
	owner := map[string]string{}
	for _, cat := range syncExcluded {
		for _, p := range c[cat] {
			if prev, dup := owner[p]; dup {
				fmt.Printf("  contract error: %q listed in both %s and %s\n", p, prev, cat)
				fail = true
				continue
			}
			owner[p] = cat
		}
	}

	// 2. The template sync must exclude every owned/preserved/generated/build_artifact path,
	//    or an overlay would clobber/delete it. We scope the search to the `sync:` task body
	//    (not the whole Taskfile — other tasks like `stub` mention some of these paths too).
	//    Excludes are written --exclude='/path' or '.name'; matching the path followed by a
	//    quote keeps content/family distinct from content/families.
	if data, err := os.ReadFile(templateTaskfile); err != nil {
		fmt.Printf("  (template Taskfile not found at %s — skipped sync audit)\n", templateTaskfile)
	} else if block := taskBody(string(data), "sync"); block == "" {
		fmt.Printf("  (no `sync:` task found in %s — skipped sync audit)\n", templateTaskfile)
		fail = true
	} else {
		for _, cat := range syncExcluded {
			for _, p := range c[cat] {
				if !strings.Contains(block, p+"'") {
					fmt.Printf("  sync does NOT exclude: %s   (%s)\n", p, cat)
					fail = true
				}
			}
		}
	}

	if fail {
		fmt.Println("repo: ownership FAILED — see above.")
		return 1
	}
	fmt.Println("repo: ownership contract OK and template sync conforms.")
	return 0
}

// taskBody returns the lines of one task from a go-task Taskfile — from its `  <name>:`
// header down to (but not including) the next 2-space-indented task header or EOF. Returns
// "" if the task is not found. Good enough to scope a search to a single task's commands.
func taskBody(text, name string) string {
	lines := strings.Split(text, "\n")
	header := "  " + name + ":"
	start := -1
	for i, ln := range lines {
		if ln == header || strings.HasPrefix(ln, header+" ") {
			start = i
			break
		}
	}
	if start < 0 {
		return ""
	}
	end := len(lines)
	for i := start + 1; i < len(lines); i++ {
		ln := lines[i]
		// next sibling task: exactly two spaces of indent, then a non-space (a key).
		if strings.HasPrefix(ln, "  ") && len(ln) > 2 && ln[2] != ' ' && ln[2] != '\t' && ln[2] != '#' {
			end = i
			break
		}
	}
	return strings.Join(lines[start:end], "\n")
}

// clean deletes every top-level entry not in the keep-set — resetting the workspace to the
// owned skeleton. The bulk is regenerable: `cd ../tartan-dictionary-template && task generate`.
func clean(c map[string][]string) {
	keep := map[string]bool{}
	for _, p := range keepSet(c) {
		keep[p] = true
	}
	// Safety: if the contract failed to parse, refuse to delete the tree.
	if !keep["Taskfile.yml"] {
		fatal("contract parse looks wrong (Taskfile.yml not in keep set) — aborting before any deletion")
	}
	entries, err := os.ReadDir(".")
	if err != nil {
		fatal("read workspace root: %v", err)
	}
	for _, e := range entries {
		if keep[e.Name()] {
			continue
		}
		if err := os.RemoveAll(e.Name()); err != nil {
			fatal("remove %s: %v", e.Name(), err)
		}
		fmt.Printf("  removed %s\n", e.Name())
	}
	fmt.Println("repo: workspace reset to the owned skeleton.")
}
